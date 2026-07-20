import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unlockall')
    .setDescription('Unlock all text channels')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const channels = interaction.guild.channels.cache.filter(c => c.isTextBased() && c.manageable);
      let count = 0;
      for (const c of channels.values()) {
        try { await c.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null }); count++; } catch {}
      }
      const record = caseManager.create(interaction.guild.id, { type: 'unlock', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: `Unlocked ${count} channels` });
      await sendModLog(interaction.guild, record);
      await interaction.editReply(`🔓 Unlocked ${count} channels`);
    } catch (err) {
      await interaction.editReply(`❌ Failed: ${err.message}`);
    }
  },
};
