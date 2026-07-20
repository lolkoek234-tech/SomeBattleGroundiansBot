import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modConfigManager } from '../../../utils/modConfigManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('modconfig')
    .setDescription('Configure moderation settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sc => sc.setName('logchannel').setDescription('Set moderation log channel').addChannelOption(o => o.setName('channel').setDescription('Log channel').setRequired(true)))
    .addSubcommand(sc => sc.setName('muterole').setDescription('Set mute role').addRoleOption(o => o.setName('role').setDescription('Mute role').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'logchannel') {
      modConfigManager.set(interaction.guild.id, { logChannel: interaction.options.getChannel('channel', true).id });
      await interaction.reply({ content: '✅ Log channel set', flags: 64 });
    } else if (sub === 'muterole') {
      modConfigManager.set(interaction.guild.id, { muteRole: interaction.options.getRole('role', true).id });
      await interaction.reply({ content: '✅ Mute role set', flags: 64 });
    }
  },
};
