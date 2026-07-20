import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lockall')
    .setDescription('Lock all text channels')
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const reason = interaction.options.getString('reason') || 'Server lockdown';

    try {
      const channels = interaction.guild.channels.cache.filter(c => c.isTextBased() && c.manageable);
      let count = 0;
      for (const c of channels.values()) {
        try { await c.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }); count++; } catch {}
      }
      const record = caseManager.create(interaction.guild.id, { type: 'lock', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: `${reason} (${count} channels)` });
      await sendModLog(interaction.guild, record);
      await interaction.editReply({ embeds: [modEmbed({ desc: `Locked ${count} channels` })] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
