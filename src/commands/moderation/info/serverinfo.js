import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { modEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get detailed server information'),

  async execute(interaction) {
    await interaction.deferReply();
    const g = interaction.guild;
    const channels = g.channels.cache;
    const roles = g.roles.cache;
    const boosts = g.premiumSubscriptionCount || 0;

    await g.members.fetch();
    const bots = g.members.cache.filter(m => m.user.bot).size;
    const humans = g.memberCount - bots;
    const textCh = channels.filter(c => c.isTextBased()).size;
    const voiceCh = channels.filter(c => c.isVoiceBased()).size;
    const categoryCh = channels.filter(c => c.type === ChannelType.GuildCategory).size;

    const embed = modEmbed({
      title: g.name,
      thumb: g.iconURL({ size: 256 }),
      fields: [
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Server ID', value: g.id, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Members', value: `**${humans}** users • **${bots}** bots`, inline: true },
        { name: 'Channels', value: `**${textCh}** text • **${voiceCh}** voice • **${categoryCh}** categories`, inline: true },
        { name: 'Roles', value: `**${roles.size - 1}** roles`, inline: true },
        { name: 'Boosts', value: `Level **${g.premiumTier}** • **${boosts}** boosts`, inline: true },
        { name: 'Security', value: `Verification: **${g.verificationLevel}**\nContent filter: **${g.explicitContentFilter}**`, inline: true },
        { name: 'Locale', value: g.preferredLocale || 'en-US', inline: true },
      ],
    });

    if (g.bannerURL()) embed.setImage(g.bannerURL());
    if (g.description) embed.setDescription(g.description);

    await interaction.editReply({ embeds: [embed] });
  },
};
