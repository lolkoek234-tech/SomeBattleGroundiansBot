import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('View recent moderation cases')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Filter by user')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user');
    const filter = user ? { userId: user.id } : {};
    const cases = caseManager.list(interaction.guild.id, filter).slice(0, 10);

    if (!cases.length) return interaction.editReply('No cases found.');

    const embed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setTitle(`Mod Logs${user ? ` — ${user.tag}` : ''}`)
      .setDescription(cases.map(c =>
        `\`#${c.id}\` **${c.type.toUpperCase()}** — <@${c.userId}> — ${c.reason?.slice(0, 50) || 'No reason'} — <t:${Math.floor(new Date(c.timestamp).getTime() / 1000)}:R>`
      ).join('\n'))
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
