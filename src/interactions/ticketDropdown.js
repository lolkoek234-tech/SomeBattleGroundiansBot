import { MessageFlags } from 'discord.js';
import { configManager } from '../configManager.js';
import { ticketManager } from '../utils/ticketManager.js';

const TYPE_LABELS = {
  support: 'Support',
  player_report: 'Player Report',
  content_creator: 'Content Creator Application',
  staff_application: 'Staff Application',
  tester_application: 'Tester Application',
};

export const handleTicketDropdown = async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket_type_select') return false;

  const type = interaction.values[0];
  if (!type) return false;

  const config = configManager.get(interaction.guild.id);
  if (config?.ticketTypes?.[type] === false) {
    await interaction.reply({ content: `${TYPE_LABELS[type] || type} is not currently accepting applications.`, flags: MessageFlags.Ephemeral });
    return true;
  }

  await interaction.deferReply();

  try {
    const channel = await ticketManager.create(interaction.guild, interaction.member, type);
    await interaction.editReply(`Ticket created! Check ${channel}`);
  } catch (err) {
    await interaction.editReply(`${err.message}`);
  }
  return true;
};
