import { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder, Colors } from 'discord.js';
import { caseManager } from '../../utils/caseManager.js';
import { chartGenerator } from '../../utils/chartGenerator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Generate server moderation statistics chart')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const gid = interaction.guild.id;

    const all = caseManager.list(gid);
    const now = Date.now();
    const dayMs = 86400000;
    const casesPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i * dayMs);
      const dayEnd = dayStart + dayMs;
      const count = all.filter(c => {
        const t = new Date(c.timestamp).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      const d = new Date(dayStart);
      casesPerDay.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, count });
    }

    try {
      const buffer = await chartGenerator.moderationChart(casesPerDay);
      const attachment = new AttachmentBuilder(buffer, { name: 'stats.png' });

      const embed = new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setTitle('Server Moderation Statistics')
        .setDescription(`Total cases: ${all.length} | Last 7 days`)
        .setImage('attachment://stats.png')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (err) {
      await interaction.editReply(`❌ Chart generation failed: ${err.message}`);
    }
  },
};
