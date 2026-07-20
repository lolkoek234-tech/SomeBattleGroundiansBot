import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete').setRequired(true).setMinValue(1).setMaxValue(100)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const amount = interaction.options.getInteger('amount', true);

    try {
      const msgs = await interaction.channel.messages.fetch({ limit: Math.min(amount, 100) });
      await interaction.channel.bulkDelete(msgs);
      const record = caseManager.create(interaction.guild.id, { type: 'purge', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: `Purged ${msgs.size} messages` });
      await sendModLog(interaction.guild, record);
      const reply = await interaction.channel.send({ embeds: [modEmbed({ desc: `🧹 Deleted ${msgs.size} messages` })] });
      setTimeout(() => reply.delete().catch(() => {}), 3000);
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
