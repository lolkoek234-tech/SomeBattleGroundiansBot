import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modManager } from '../../utils/modManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removetimeout')
    .setDescription('Remove timeout from a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to remove timeout from').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.editReply('❌ User not in server.');

    try {
      const record = await modManager.execute(interaction.guild, 'removetimeout', user.id, interaction.user.id, 'Timeout removed');
      await interaction.editReply(`✅ Removed timeout from ${user.tag} | Case #${record.id}`);
    } catch (err) {
      await interaction.editReply(`❌ Failed: ${err.message}`);
    }
  },
};
