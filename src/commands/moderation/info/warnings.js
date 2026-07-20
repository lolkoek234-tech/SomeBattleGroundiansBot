import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } from 'discord.js';
import { warnManager } from '../../utils/warnManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const warns = warnManager.list(interaction.guild.id, user.id);

    if (!warns.length) return interaction.editReply(`${user.tag} has no warnings.`);

    const embed = new EmbedBuilder()
      .setColor(Colors.Yellow)
      .setTitle(`Warnings — ${user.tag}`)
      .setDescription(warns.map((w, i) =>
        `**#${i + 1}** — ${w.reason} — <t:${Math.floor(new Date(w.timestamp).getTime() / 1000)}:R> — <@${w.moderatorId}>`
      ).join('\n'))
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
