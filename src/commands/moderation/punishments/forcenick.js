import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modManager } from '../../../utils/modManager.js';
import { successEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('forcenick')
    .setDescription('Force change a member\'s nickname')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
    .addStringOption(o => o.setName('nickname').setDescription('New nickname').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const nickname = interaction.options.getString('nickname', true);
    const reason = interaction.options.getString('reason') || 'Nickname changed';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.editReply({ embeds: [errorEmbed('User not in server.')] });

    try {
      const record = await modManager.execute(interaction.guild, 'forcenick', user.id, interaction.user.id, reason, { nickname });
      await interaction.editReply({ embeds: [successEmbed(`Changed ${user.tag}'s nickname | Case #${record.id}`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
