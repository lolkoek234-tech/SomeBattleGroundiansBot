import { ticketManager } from '../utils/ticketManager.js';

export const handleClaimButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'claim_ticket') return false;

  try {
    await ticketManager.claim(interaction);
  } catch (err) {
    await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
  }
  return true;
};
