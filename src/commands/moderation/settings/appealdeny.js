import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { successEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('appealdeny')
    .setDescription('Deny an appeal for a case')
    .addIntegerOption(o => o.setName('case_id').setDescription('Case ID').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for denial')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const id = interaction.options.getInteger('case_id', true);
    const reason = interaction.options.getString('reason') || 'Appeal denied';

    const record = caseManager.get(interaction.guild.id, id);
    if (!record) return interaction.editReply({ embeds: [errorEmbed('Case not found.')] });

    caseManager.update(interaction.guild.id, id, { active: false });
    await interaction.editReply({ embeds: [successEmbed(`Appeal denied for Case #${id}: ${reason}`)] });
  },
};
