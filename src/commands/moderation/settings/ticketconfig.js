import { SlashCommandBuilder, PermissionFlagsBits, Routes } from 'discord.js';
import { configManager } from '../../../configManager.js';
import { buildTicketPanel } from '../../../utils/embedBuilder.js';
import { modEmbed } from '../../../utils/modEmbed.js';

const TYPE_LABELS = {
  support: 'Support',
  player_report: 'Player Report',
  content_creator: 'Content Creator Application',
  staff_application: 'Staff Application',
  tester_application: 'Tester Application',
};

export default {
  data: new SlashCommandBuilder()
    .setName('ticketconfig')
    .setDescription('Configure ticket system settings')
    .addSubcommand(sc => sc
      .setName('toggle')
      .setDescription('Enable or disable a ticket type')
      .addStringOption(o => o
        .setName('type')
        .setDescription('Ticket type to toggle')
        .setRequired(true)
        .addChoices(
          { name: 'Support', value: 'support' },
          { name: 'Player Report', value: 'player_report' },
          { name: 'Content Creator Application', value: 'content_creator' },
          { name: 'Staff Application', value: 'staff_application' },
          { name: 'Tester Application', value: 'tester_application' },
        ))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'toggle') {
      const type = interaction.options.getString('type', true);
      const config = configManager.get(interaction.guild.id);
      if (!config) {
        return interaction.reply({ embeds: [modEmbed({ desc: 'Server not configured. Run /setup first.' })], ephemeral: true });
      }

      const ticketTypes = config.ticketTypes || {};
      const current = ticketTypes[type];
      if (current === undefined) {
        return interaction.reply({ embeds: [modEmbed({ desc: 'Invalid ticket type.' })], ephemeral: true });
      }

      const newState = !current;
      ticketTypes[type] = newState;
      configManager.update(interaction.guild.id, { ticketTypes });

      if (config.panelMessageId && config.ticketChannelId) {
        try {
          const channel = await interaction.guild.channels.fetch(config.ticketChannelId);
          if (channel) {
            const panelMsg = await channel.messages.fetch(config.panelMessageId).catch(() => null);
            if (panelMsg) {
              const emojis = config.emojis || {};
              const bannerUrl = 'attachment://support_card.png';
              const panelData = buildTicketPanel(bannerUrl, emojis, ticketTypes);
              await interaction.client.rest.patch(
                Routes.channelMessage(config.ticketChannelId, config.panelMessageId),
                { body: { components: panelData.components } },
              );
            }
          }
        } catch (err) {
          console.error('Failed to update panel:', err.message);
        }
      }

      const label = TYPE_LABELS[type] || type;
      const status = newState ? 'enabled' : 'disabled';
      await interaction.reply({ embeds: [modEmbed({ desc: `${label} is now **${status}**.` })] });
    }
  },
};
