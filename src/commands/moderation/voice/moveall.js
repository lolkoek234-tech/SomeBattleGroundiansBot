import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('moveall')
    .setDescription('Move all members from one voice channel to another')
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .addChannelOption(o => o.setName('source').setDescription('Source voice channel').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
    .addChannelOption(o => o.setName('target').setDescription('Target voice channel').setRequired(true).addChannelTypes(ChannelType.GuildVoice)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const source = interaction.options.getChannel('source', true);
    const target = interaction.options.getChannel('target', true);

    try {
      const members = [...source.members.values()];
      let count = 0;
      for (const m of members) {
        try { await m.voice.setChannel(target); count++; } catch {}
      }
      const record = caseManager.create(interaction.guild.id, { type: 'moveall', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: `Moved ${count} members from ${source.name} to ${target.name}` });
      await sendModLog(interaction.guild, record);
      await interaction.editReply({ embeds: [modEmbed({ desc: `🔀 Moved ${count} members to ${target.name}` })] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
