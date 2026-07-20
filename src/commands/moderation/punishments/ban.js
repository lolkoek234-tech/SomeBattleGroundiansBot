import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modManager } from '../../../utils/modManager.js';
import { successEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Permanently ban a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the ban'))
    .addIntegerOption(o => o.setName('delete_days').setDescription('Days of messages to delete').setMinValue(0).setMaxValue(7))
    .addStringOption(o => o.setName('evidence').setDescription('Evidence URL')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;
    const evidence = interaction.options.getString('evidence');

    if (interaction.guild.members.cache.get(user.id)?.roles?.highest?.position >= interaction.member.roles.highest.position) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot ban this user (same or higher role).')] });
    }

    try {
      const record = await modManager.execute(interaction.guild, 'ban', user.id, interaction.user.id, reason, { deleteDays, evidence });
      await interaction.editReply({ embeds: [successEmbed(`Banned ${user.tag} | Case #${record.id}`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
