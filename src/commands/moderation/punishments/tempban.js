import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modManager } from '../../../utils/modManager.js';
import { successEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Temporarily ban a member')
    .addUserOption(o => o.setName('user').setDescription('Member to ban').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 1h, 2d, 7d)').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .addStringOption(o => o.setName('evidence').setDescription('Evidence URL')),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user', true);
    const durationStr = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const evidence = interaction.options.getString('evidence');

    const ms = (str) => {
      const match = str.match(/^(\d+)(s|m|h|d)$/);
      if (!match) return null;
      const n = parseInt(match[1]);
      const unit = match[2];
      return n * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit] || 0);
    };
    const duration = ms(durationStr);
    if (!duration) return interaction.editReply({ embeds: [errorEmbed('Invalid duration. Use format like 1h, 2d, 30m.')] });

    if (interaction.guild.members.cache.get(user.id)?.roles?.highest?.position >= interaction.member.roles.highest.position) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot ban this user (same or higher role).')] });
    }

    try {
      const record = await modManager.execute(interaction.guild, 'tempban', user.id, interaction.user.id, reason, { duration, evidence });
      await interaction.editReply({ embeds: [successEmbed(`Temp-banned ${user.tag} for ${durationStr} | Case #${record.id}`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
