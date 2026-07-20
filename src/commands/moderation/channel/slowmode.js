import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode in a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode in seconds').setRequired(true).setMinValue(0).setMaxValue(21600)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const seconds = interaction.options.getInteger('seconds', true);

    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      const record = caseManager.create(interaction.guild.id, { type: 'slowmode', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: `Slowmode set to ${seconds}s` });
      await sendModLog(interaction.guild, record);
      await interaction.editReply({ embeds: [modEmbed({ desc: `🐢 Slowmode set to ${seconds}s` })] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
