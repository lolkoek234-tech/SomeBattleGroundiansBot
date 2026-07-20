import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { warnManager } from '../../../utils/warnManager.js';
import { modEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('View full moderation history for a user')
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.options.getUser('user', true);
    const cases = caseManager.list(interaction.guild.id, { userId: user.id });
    const warns = warnManager.list(interaction.guild.id, user.id);

    const embed = modEmbed({
      title: `History — ${user.tag}`,
      thumb: user.displayAvatarURL(),
      fields: [
        { name: 'Total Cases', value: `${cases.length}`, inline: true },
        { name: 'Warnings', value: `${warns.length}`, inline: true },
        { name: 'Active Punishments', value: `${cases.filter(c => c.active).length}`, inline: true },
      ],
    });

    if (cases.length > 0) {
      embed.addFields({ name: 'Recent Actions', value: cases.slice(0, 5).map(c =>
        `\`#${c.id}\` **${c.type.toUpperCase()}** — ${c.reason?.slice(0, 40) || 'No reason'} — <t:${Math.floor(new Date(c.timestamp).getTime() / 1000)}:R>`
      ).join('\n') });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
