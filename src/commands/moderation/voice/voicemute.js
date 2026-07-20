import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('voicemute')
    .setDescription('Server voice mute a member')
    .addUserOption(o => o.setName('user').setDescription('Member to mute').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member?.voice?.channel) return interaction.editReply({ embeds: [errorEmbed('User not in a voice channel.')] });

    try {
      await member.voice.setMute(true, reason);
      const record = caseManager.create(interaction.guild.id, { type: 'voicemute', userId: user.id, moderatorId: interaction.user.id, reason });
      await sendModLog(interaction.guild, record);
      await interaction.editReply({ embeds: [modEmbed({ desc: `🔇 Voice muted ${user.tag}` })] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
