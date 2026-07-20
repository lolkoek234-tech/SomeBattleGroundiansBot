import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { warnManager } from '../../../utils/warnManager.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { successEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear all warnings for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);

    warnManager.clear(interaction.guild.id, user.id);
    const record = caseManager.create(interaction.guild.id, { type: 'note', userId: user.id, moderatorId: interaction.user.id, reason: 'All warnings cleared' });
    await sendModLog(interaction.guild, record);
    await interaction.editReply({ embeds: [successEmbed(`Cleared all warnings for ${user.tag}`)] });
  },
};
