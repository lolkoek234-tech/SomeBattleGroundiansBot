import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('View a moderation case')
    .addIntegerOption(o => o.setName('case_id').setDescription('Case ID').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const id = interaction.options.getInteger('case_id', true);
    const record = caseManager.get(interaction.guild.id, id);

    if (!record) return interaction.editReply({ embeds: [errorEmbed('Case not found.')] });

    const embed = modEmbed({
      title: `Case #${record.id} — ${record.type.toUpperCase()}`,
      fields: [
        { name: 'User', value: `<@${record.userId}>`, inline: true },
        { name: 'Moderator', value: `<@${record.moderatorId}>`, inline: true },
        { name: 'Reason', value: record.reason || 'No reason' },
        { name: 'Status', value: record.active ? 'Active' : 'Resolved', inline: true },
        { name: 'Date', value: `<t:${Math.floor(new Date(record.timestamp).getTime() / 1000)}:R>`, inline: true },
      ],
    });

    if (record.duration) embed.addFields({ name: 'Duration', value: `${Math.floor(record.duration / 3600000)}h`, inline: true });
    if (record.evidence) embed.setImage(record.evidence);

    await interaction.editReply({ embeds: [embed] });
  },
};
