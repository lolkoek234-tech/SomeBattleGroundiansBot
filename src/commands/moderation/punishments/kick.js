import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modManager } from '../../../utils/modManager.js';
import { successEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(o => o.setName('user').setDescription('Member to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.guild.members.cache.get(user.id)) {
      return interaction.editReply({ embeds: [errorEmbed('User not in server.')] });
    }

    try {
      const record = await modManager.execute(interaction.guild, 'kick', user.id, interaction.user.id, reason);
      await interaction.editReply({ embeds: [successEmbed(`Kicked ${user.tag} | Case #${record.id}`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
