import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modManager } from '../../utils/modManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban then immediately unban to clear messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to softban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.editReply('❌ User not in server.');

    try {
      const record = await modManager.execute(interaction.guild, 'softban', user.id, interaction.user.id, reason);
      await interaction.editReply(`✅ Softbanned ${user.tag} (messages cleared) | Case #${record.id}`);
    } catch (err) {
      await interaction.editReply(`❌ Failed: ${err.message}`);
    }
  },
};
