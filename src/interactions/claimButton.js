import { MessageFlags } from 'discord.js';
import { ticketManager } from '../utils/ticketManager.js';

export const handleClaimButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'claim_ticket') return false;

  try {
    await ticketManager.claim(interaction);
    return true;
  } catch (err) {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: `${err.message}` });
    } else {
      await interaction.reply({ content: `${err.message}`, flags: MessageFlags.Ephemeral });
    }
    return true;
  }
};
