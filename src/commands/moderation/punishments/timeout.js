import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modManager } from '../../../utils/modManager.js';
import { successEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .addUserOption(o => o.setName('user').setDescription('Member to timeout').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 10m, 1h, 7d)').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.options.getUser('user', true);
    const durationStr = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const ms = (str) => {
      const match = str.match(/^(\d+)(s|m|h|d)$/);
      if (!match) return null;
      const n = parseInt(match[1]);
      const unit = match[2];
      return n * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit] || 0);
    };
    const duration = ms(durationStr);
    if (!duration || duration > 2419200000) return interaction.editReply({ embeds: [errorEmbed('Invalid duration. Max 28d. Use format like 10m, 1h, 7d.')] });

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.editReply({ embeds: [errorEmbed('User not in server.')] });

    try {
      const record = await modManager.execute(interaction.guild, 'timeout', user.id, interaction.user.id, reason, { duration });
      await interaction.editReply({ embeds: [successEmbed(`Timed out ${user.tag} for ${durationStr} | Case #${record.id}`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
