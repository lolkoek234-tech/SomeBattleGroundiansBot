import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { modEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('List all banned users')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const bans = await interaction.guild.bans.fetch();
      if (!bans.size) return interaction.editReply({ embeds: [errorEmbed('No bans.')] });

      const pages = [];
      let page = '';
      let i = 0;
      for (const ban of bans.values()) {
        page += `\`${ban.user.id}\` **${ban.user.tag}** — ${ban.reason || 'No reason'}\n`;
        i++;
        if (i % 15 === 0) { pages.push(page); page = ''; }
      }
      if (page) pages.push(page);

      const embed = modEmbed({
        title: `Ban List — ${bans.size} total`,
        desc: pages[0],
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }
  },
};
