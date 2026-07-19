import { ticketManager } from '../utils/ticketManager.js';

export const handleTicketDropdown = async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket_type_select') return false;

  const type = interaction.values[0];
  if (!type) return false;
  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await ticketManager.create(interaction.guild, interaction.member, type);
    await interaction.editReply(`✅ Ticket created! Check ${channel}`);
  } catch (err) {
    await interaction.editReply(`❌ ${err.message}`);
  }
  return true;
};
