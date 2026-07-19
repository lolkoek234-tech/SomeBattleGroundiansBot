import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, Routes } from 'discord.js';
import { existsSync } from 'fs';
import { configManager } from '../configManager.js';
import { buildTicketPanel } from '../utils/embedBuilder.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the ticket system in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

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

      const assetPath = join(__dirname, '..', '..', 'assets', 'support_card.png');
      if (!existsSync(assetPath)) {
        return interaction.editReply('❌ Setup failed: `assets/support_card.png` not found. Please add the image file.');
      }

      const panelData = buildTicketPanel('');

      const panelMsgRaw = await interaction.client.rest.post(Routes.channelMessages(interaction.channel.id), {
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
