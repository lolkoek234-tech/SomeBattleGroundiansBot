import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { modEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('note')
    .setDescription('Add an internal note to a user\'s record')
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true))
    .addStringOption(o => o.setName('content').setDescription('Note content').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const content = interaction.options.getString('content', true);

    const record = caseManager.create(interaction.guild.id, { type: 'note', userId: user.id, moderatorId: interaction.user.id, reason: content });
    await sendModLog(interaction.guild, record);
    await interaction.editReply({ embeds: [modEmbed({ desc: `📝 Note added to ${user.tag} | Case #${record.id}` })] });
  },
};
