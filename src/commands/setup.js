import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, Routes, MessageFlags } from 'discord.js';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { configManager } from '../configManager.js';
import { buildTicketPanel } from '../utils/embedBuilder.js';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the ticket system in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    await interaction.editReply('Please mention the staff roles that should have access to tickets (e.g. @Admin @Mod). Send one or more messages mentioning roles, then type `done` when finished.');

    const filter = (msg) => msg.author.id === interaction.user.id;
    const staffRoleIds = new Set();

    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });
    try {
      await new Promise((resolve, reject) => {
        collector.on('collect', (msg) => {
          if (msg.content.toLowerCase() === 'done') {
            collector.stop();
            resolve();
            return;
          }
          msg.mentions.roles.forEach(r => staffRoleIds.add(r.id));
        });
        collector.on('end', (_, reason) => {
          if (reason === 'time') reject(new Error('timeout'));
        });
      });
    } catch {
      return interaction.editReply('Setup timed out. Run /setup again.');
    }

    const staffRoles = [...staffRoleIds];
    if (staffRoles.length === 0) {
      return interaction.editReply('No roles mentioned. Run /setup again and mention at least one staff role.');
    }

    try {
      let category = interaction.guild.channels.cache.find(c => c.name === 'Tickets' && c.type === ChannelType.GuildCategory);
      if (!category) {
        category = await interaction.guild.channels.create({
          name: 'Tickets',
          type: ChannelType.GuildCategory,
        });
      }

      let logChannel = interaction.guild.channels.cache.find(c => c.name === 'ticket-logs' && c.parentId === category.id);
      if (!logChannel) {
        logChannel = await interaction.guild.channels.create({
          name: 'ticket-logs',
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            ...staffRoles.map(roleId => ({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] })),
          ],
        });
      }

      const assetDir = join(__dirname, '..', '..', 'assets');
      const imageFiles = ['support_card.png', 'General Support.png', 'Report.png', 'Content Creator.png'];
      for (const f of imageFiles) {
        if (!existsSync(join(assetDir, f))) {
          return interaction.editReply(`❌ Setup failed: \`assets/${f}\` not found.`);
        }
      }

      const images = {
        ticketTypes: [
          { url: 'attachment://General%20Support.png', label: 'Support' },
          { url: 'attachment://Report.png', label: 'Player Report' },
          { url: 'attachment://Content%20Creator.png', label: 'Content Creator Application' },
        ],
      };

      const panelData = buildTicketPanel(images);

      const panelMsgRaw = await interaction.client.rest.post(Routes.channelMessages(interaction.channel.id), {
        files: imageFiles.map(f => ({
          data: readFileSync(join(assetDir, f)),
          name: f,
          contentType: 'image/png',
        })),
        body: {
          flags: 32768,
          components: panelData.components,
        },
      });

      let panelMsg = interaction.channel.messages.cache.get(panelMsgRaw.id);
      if (!panelMsg) {
        panelMsg = await interaction.channel.messages.fetch(panelMsgRaw.id);
      }

      configManager.set(interaction.guild.id, {
        staffRoles,
        ticketChannelId: interaction.channel.id,
        categoryId: category.id,
        logChannelId: logChannel.id,
        ticketCounter: 0,
        panelMessageId: panelMsg.id,
      });

      await interaction.editReply('✅ Ticket system is set up!');
    } catch (err) {
      console.error('Setup failed:', err);
      await interaction.editReply(`❌ Setup failed: ${err.message}`);
    }
  }
};
