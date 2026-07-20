import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get detailed server information')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const g = interaction.guild;
    const members = g.members.cache;
    const channels = g.channels.cache;
    const roles = g.roles.cache;

    const embed = new EmbedBuilder()
      .setColor(Colors.Blurple)
      .setTitle(g.name)
      .setThumbnail(g.iconURL({ size: 256 }))
      .addFields(
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Members', value: `${members.filter(m => !m.user.bot).size} users • ${members.filter(m => m.user.bot).size} bots`, inline: true },
        { name: 'Channels', value: `${channels.filter(c => c.isTextBased()).size} text • ${channels.filter(c => c.isVoiceBased()).size} voice`, inline: true },
        { name: 'Roles', value: `${roles.size - 1}`, inline: true },
        { name: 'Boost', value: `Level ${g.premiumTier} (${g.premiumSubscriptionCount || 0} boosts)`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
      )
      .setFooter({ text: `ID: ${g.id}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
