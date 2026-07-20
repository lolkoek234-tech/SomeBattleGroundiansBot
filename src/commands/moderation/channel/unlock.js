import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { caseManager } from '../../utils/caseManager.js';
import { sendModLog } from '../../utils/modLog.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o => o.setName('channel').setDescription('Channel to unlock').addChannelTypes(ChannelType.GuildText)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
      const record = caseManager.create(interaction.guild.id, { type: 'unlock', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: 'Unlocked' });
      await sendModLog(interaction.guild, record);
      await interaction.editReply(`🔓 Unlocked ${channel}`);
    } catch (err) {
      await interaction.editReply(`❌ Failed: ${err.message}`);
    }
  },
};
