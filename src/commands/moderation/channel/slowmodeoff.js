import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../utils/caseManager.js';
import { sendModLog } from '../../utils/modLog.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmodeoff')
    .setDescription('Disable slowmode in the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      await interaction.channel.setRateLimitPerUser(0);
      const record = caseManager.create(interaction.guild.id, { type: 'slowmode', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: 'Slowmode disabled' });
      await sendModLog(interaction.guild, record);
      await interaction.editReply('🐢 Slowmode disabled');
    } catch (err) {
      await interaction.editReply(`❌ Failed: ${err.message}`);
    }
  },
};
