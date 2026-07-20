import { SlashCommandBuilder, PermissionFlagsBits, Routes } from 'discord.js';
import { configManager } from '../../../configManager.js';
import { buildTicketPanel } from '../../../utils/embedBuilder.js';
import { modEmbed } from '../../../utils/modEmbed.js';

const DEFAULT_TICKET_TYPES = {
  support: true,
  player_report: true,
  content_creator: true,
  staff_application: true,
  tester_application: true,
};

export default {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update the ticket panel to the latest version')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply();

    const config = configManager.get(interaction.guild.id);
    if (!config) {
      return interaction.editReply({ embeds: [modEmbed({ desc: 'Server not configured. Run /setup first.' })] });
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

    const ticketTypes = { ...DEFAULT_TICKET_TYPES, ...(config.ticketTypes || {}) };

    const panelData = buildTicketPanel('attachment://support_card.png', emojis, ticketTypes);
    const channelId = config.ticketChannelId || interaction.channel.id;

    let panelMsgId = null;

    if (config.panelMessageId && config.ticketChannelId) {
      try {
        const channel = await interaction.guild.channels.fetch(config.ticketChannelId);
        const oldMsg = await channel?.messages.fetch(config.panelMessageId).catch(() => null);
        if (oldMsg) {
          await interaction.client.rest.patch(
            Routes.channelMessage(config.ticketChannelId, config.panelMessageId),
            { body: { components: panelData.components } },
          );
          panelMsgId = config.panelMessageId;
        }
      } catch {}
    }

    if (!panelMsgId) {
      const channel = await interaction.guild.channels.fetch(channelId);
      const newMsg = await interaction.client.rest.post(Routes.channelMessages(channelId), {
        body: { flags: 32768, components: panelData.components },
      });
      panelMsgId = newMsg.id;
    }

    configManager.update(interaction.guild.id, {
      ticketChannelId: channelId,
      panelMessageId: panelMsgId,
      emojis,
      ticketTypes,
    });

    await interaction.editReply({ embeds: [modEmbed({ desc: 'Ticket panel updated to the latest version.' })] });
  },
};
