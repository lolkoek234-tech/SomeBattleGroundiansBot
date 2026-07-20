import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { warnManager } from '../../../utils/warnManager.js';
import { modEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get detailed user information')
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const member = interaction.guild.members.cache.get(user.id);
    const warns = warnManager.list(interaction.guild.id, user.id);
    const cases = caseManager.list(interaction.guild.id, { userId: user.id });

    const embed = modEmbed({
      author: { name: user.tag, iconURL: user.displayAvatarURL() },
      thumb: user.displayAvatarURL({ size: 256 }),
      fields: [
        { name: 'ID', value: user.id, inline: true },
        { name: 'Joined', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
        { name: 'Registered', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Roles', value: member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(' ') || 'None' : 'N/A' },
        { name: 'Warnings', value: `${warns.length}`, inline: true },
        { name: 'Cases', value: `${cases.length}`, inline: true },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
