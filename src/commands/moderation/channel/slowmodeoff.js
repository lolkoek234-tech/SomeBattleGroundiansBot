import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmodeoff')
    .setDescription('Disable slowmode in the current channel'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      await interaction.channel.setRateLimitPerUser(0);
      const record = caseManager.create(interaction.guild.id, { type: 'slowmode', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: 'Slowmode disabled' });
      await sendModLog(interaction.guild, record);
      await interaction.editReply({ embeds: [modEmbed({ desc: 'Slowmode disabled' })] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
