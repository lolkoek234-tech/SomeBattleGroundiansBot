import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { warnManager } from '../../utils/warnManager.js';
import { caseManager } from '../../utils/caseManager.js';
import { sendModLog } from '../../utils/modLog.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removewarn')
    .setDescription('Remove a specific warning from a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true))
    .addIntegerOption(o => o.setName('index').setDescription('Warning number (use /warnings to find it)').setRequired(true).setMinValue(1)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const user = interaction.options.getUser('user', true);
    const index = interaction.options.getInteger('index', true) - 1;

    const removed = warnManager.remove(interaction.guild.id, user.id, index);
    if (!removed) return interaction.editReply('❌ Warning not found.');

    const record = caseManager.create(interaction.guild.id, { type: 'note', userId: user.id, moderatorId: interaction.user.id, reason: `Warning #${index + 1} removed: ${removed.reason}` });
    await sendModLog(interaction.guild, record);
    await interaction.editReply(`✅ Removed warning #${index + 1} from ${user.tag}`);
  },
};
