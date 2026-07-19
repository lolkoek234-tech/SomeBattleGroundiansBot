import { ticketManager } from '../utils/ticketManager.js';

export const handleCloseButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'close_ticket') return false;

  try {
    await ticketManager.close(interaction);
  } catch (err) {
    await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
  }
  return true;
};
