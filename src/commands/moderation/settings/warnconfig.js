import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modConfigManager } from '../../utils/modConfigManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnconfig')
    .setDescription('Configure auto-escalation for warnings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(o => o.setName('max_warns').setDescription('Max warnings before escalation').setRequired(true).setMinValue(1).setMaxValue(50))
    .addStringOption(o => o.setName('action').setDescription('Action to take').setRequired(true).addChoices({ name: 'Timeout', value: 'timeout' }, { name: 'Kick', value: 'kick' }))
    .addStringOption(o => o.setName('duration').setDescription('Duration for timeout (e.g. 1h, 1d)')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const maxWarns = interaction.options.getInteger('max_warns', true);
    const action = interaction.options.getString('action', true);
    const durationStr = interaction.options.getString('duration') || '1h';

    const ms = (str) => {
      const m = str.match(/^(\d+)(s|m|h|d)$/);
      if (!m) return 3600000;
      return parseInt(m[1]) * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]] || 3600000);
    };

    modConfigManager.set(interaction.guild.id, { maxWarns, escalationAction: action, escalationDuration: ms(durationStr) });
    await interaction.editReply(`✅ Warn config set: ${maxWarns} warns → ${action}`);
  },
};
