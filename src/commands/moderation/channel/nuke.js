import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Clone and delete a channel (nuke it)')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to nuke')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      const position = channel.position;
      const topic = channel.topic;
      const parent = channel.parentId;
      const overwrites = channel.permissionOverwrites.cache;
      await channel.delete();
      const newChannel = await interaction.guild.channels.create({
        name: channel.name,
        type: channel.type,
        parent: parent,
        topic: topic,
        position: position,
        permissionOverwrites: overwrites.toJSON(),
      });
      const record = caseManager.create(interaction.guild.id, { type: 'nuke', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: 'Channel nuked' });
      await sendModLog(interaction.guild, record);
      await newChannel.send({ embeds: [modEmbed({ desc: `Channel nuked by ${interaction.user}` })] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
