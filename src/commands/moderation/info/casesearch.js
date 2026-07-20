import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } from 'discord.js';
import { caseManager } from '../../utils/caseManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('casesearch')
    .setDescription('Search moderation cases')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addStringOption(o => o.setName('query').setDescription('Search by user ID, moderator ID, or reason').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const query = interaction.options.getString('query', true);
    const results = caseManager.search(interaction.guild.id, query);

    if (!results.length) return interaction.editReply('No matching cases found.');

    const embed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setTitle(`Search Results — "${query}"`)
      .setDescription(results.slice(0, 15).map(c =>
        `\`#${c.id}\` **${c.type.toUpperCase()}** — <@${c.userId}> — ${c.reason?.slice(0, 50) || 'No reason'}`
      ).join('\n'))
      .setFooter({ text: `${results.length} result(s)` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
