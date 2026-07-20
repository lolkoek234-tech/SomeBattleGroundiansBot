import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { warnManager } from '../../../utils/warnManager.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user', true);
    const warns = warnManager.list(interaction.guild.id, user.id);

    if (!warns.length) return interaction.editReply({ embeds: [errorEmbed(`${user.tag} has no warnings.`)] });

    const embed = modEmbed({
      title: `Warnings — ${user.tag}`,
      desc: warns.map((w, i) =>
        `**#${i + 1}** — ${w.reason} — <t:${Math.floor(new Date(w.timestamp).getTime() / 1000)}:R> — <@${w.moderatorId}>`
      ).join('\n'),
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
