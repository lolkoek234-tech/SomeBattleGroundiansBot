import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { caseManager } from '../../utils/caseManager.js';
import { sendModLog } from '../../utils/modLog.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o => o.setName('channel').setDescription('Channel to lock').addChannelTypes(ChannelType.GuildText))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'Locked by moderator';

    try {
      await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
      const record = caseManager.create(interaction.guild.id, { type: 'lock', userId: interaction.guild.id, moderatorId: interaction.user.id, reason });
      await sendModLog(interaction.guild, record);
      await interaction.editReply(`🔒 Locked ${channel}`);
    } catch (err) {
      await interaction.editReply(`❌ Failed: ${err.message}`);
    }
  },
};
