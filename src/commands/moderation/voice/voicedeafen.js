import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';

export default {
  data: new SlashCommandBuilder()
    .setName('voicedeafen')
    .setDescription('Server voice deafen a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to deafen').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member?.voice?.channel) return interaction.editReply('❌ User not in a voice channel.');

    try {
      await member.voice.setDeaf(true, reason);
      const record = caseManager.create(interaction.guild.id, { type: 'voicedeafen', userId: user.id, moderatorId: interaction.user.id, reason });
      await sendModLog(interaction.guild, record);
      await interaction.editReply(`🔇 Voice deafened ${user.tag}`);
    } catch (err) {
      await interaction.editReply(`❌ Failed: ${err.message}`);
    }
  },
};
