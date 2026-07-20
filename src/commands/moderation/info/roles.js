import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Show all roles in the server'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const roles = interaction.guild.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position);

    const chunks = [];
    let chunk = '';
    for (const role of roles.values()) {
      const line = `${role} — **${role.members.size}** members`;
      if ((chunk + line).length > 950) {
        chunks.push(chunk);
        chunk = '';
      }
      chunk += line + '\n';
    }
    if (chunk) chunks.push(chunk);

    const embed = modEmbed({
      title: `Roles — ${interaction.guild.name}`,
      desc: `**${roles.size}** total roles`,
      fields: chunks.map((c, i) => ({ name: i === 0 ? '' : '‎', value: c })),
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
