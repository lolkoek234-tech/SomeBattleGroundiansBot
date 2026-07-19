import { MessageFlags } from 'discord.js';
import { ticketManager } from '../utils/ticketManager.js';

export const handleCloseButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'close_ticket') return false;

  try {
    await ticketManager.close(interaction);
    return true;
  } catch (err) {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: `❌ ${err.message}` });
    } else {
      await interaction.reply({ content: `❌ ${err.message}`, flags: MessageFlags.Ephemeral });
    }
    return true;
  }
};
