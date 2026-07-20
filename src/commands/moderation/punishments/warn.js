import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modManager } from '../../utils/modManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
    .addStringOption(o => o.setName('evidence').setDescription('Evidence URL')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const evidence = interaction.options.getString('evidence');

    try {
      const record = await modManager.execute(interaction.guild, 'warn', user.id, interaction.user.id, reason, { evidence });
      await interaction.editReply(`✅ Warned ${user.tag} | Case #${record.id}`);
    } catch (err) {
      await interaction.editReply(`❌ Failed: ${err.message}`);
    }
  },
};
