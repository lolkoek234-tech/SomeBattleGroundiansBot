import { MessageFlags } from 'discord.js';
import { ticketManager } from '../utils/ticketManager.js';

export const handleCreateTicket = async (interaction) => {
  if (!interaction.isButton() || !interaction.customId.startsWith('create_ticket:')) return false;

  const type = interaction.customId.split(':')[1];
  if (!type) return false;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const channel = await ticketManager.create(interaction.guild, interaction.member, type);
    await interaction.editReply(`✅ Ticket created! Check ${channel}`);
  } catch (err) {
    await interaction.editReply(`❌ ${err.message}`);
  }
  return true;
};
