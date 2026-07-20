import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, Routes } from 'discord.js';
import { existsSync, readFileSync } from 'fs';
import { configManager } from '../configManager.js';
import { buildTicketPanel } from '../utils/embedBuilder.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_TICKET_TYPES = {
  support: true,
  player_report: true,
  content_creator: true,
  staff_application: false,
  tester_application: false,
};

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the ticket system in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply();

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
      const bannerFile = 'support_card.png';
      if (!existsSync(join(assetDir, bannerFile))) {
        return interaction.editReply(`Setup failed: \`assets/${bannerFile}\` not found.`);
      }

      const resolveEmoji = (name) => {
        const e = interaction.guild.emojis.cache.find(emoji => emoji.name === name);
        return e ? { name: e.name, id: e.id, animated: e.animated ?? false } : undefined;
      };

      const emojis = {
        support: resolveEmoji('General_Support'),
        player_report: resolveEmoji('Report'),
        content_creator: resolveEmoji('ContentCreator'),
        staff_application: resolveEmoji('Staff'),
        tester_application: resolveEmoji('Tester'),
      };

      const bannerUrl = 'attachment://support_card.png';
      const panelData = buildTicketPanel(bannerUrl, emojis, DEFAULT_TICKET_TYPES);

      let panelMsgId = null;
      const existingConfig = configManager.get(interaction.guild.id);
      if (existingConfig?.panelMessageId && existingConfig?.ticketChannelId) {
        try {
          const oldChannel = await interaction.guild.channels.fetch(existingConfig.ticketChannelId);
          if (oldChannel) {
            const oldMsg = await oldChannel.messages.fetch(existingConfig.panelMessageId).catch(() => null);
            if (oldMsg) {
              await interaction.client.rest.patch(
                Routes.channelMessage(existingConfig.ticketChannelId, existingConfig.panelMessageId),
                { body: { components: panelData.components } },
              );
              panelMsgId = existingConfig.panelMessageId;
              await interaction.editReply('Updated existing ticket panel.');
            }
          }
        } catch {}
      }

      if (!panelMsgId) {
        const allAssets = ['support_card.png', 'general_support.png', 'report.png', 'content_creator.png'];
        const files = allAssets.filter(f => existsSync(join(assetDir, f))).map(f => ({
          data: readFileSync(join(assetDir, f)),
          name: f,
          contentType: 'image/png',
        }));
        const panelMsgRaw = await interaction.client.rest.post(Routes.channelMessages(interaction.channel.id), {
          files,
          body: {
            flags: 32768,
            components: panelData.components,
          },
        });
        panelMsgId = panelMsgRaw.id;
        await interaction.editReply('Ticket system is set up!');
      }

      configManager.set(interaction.guild.id, {
        staffRoles,
        ticketChannelId: interaction.channel.id,
        categoryId: category.id,
        logChannelId: logChannel.id,
        ticketCounter: 0,
        panelMessageId: panelMsg.id,
        emojis,
        ticketTypes: { ...DEFAULT_TICKET_TYPES },
      });

      await interaction.editReply('Ticket system is set up!');
    } catch (err) {
      console.error('Setup failed:', err);
      await interaction.editReply(`Setup failed: ${err.message}`);
    }
  }
};
