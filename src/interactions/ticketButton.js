import { buildDropdown } from '../utils/embedBuilder.js';

export const handleTicketButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'create_ticket') return false;

  const dropdown = buildDropdown();
  await interaction.reply({ content: 'Select a ticket type:', components: [dropdown], ephemeral: true });
  return true;
};
