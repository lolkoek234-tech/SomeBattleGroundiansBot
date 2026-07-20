import { SlashCommandBuilder } from 'discord.js';
import { modEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('information')
    .setDescription('Information about the bot'),

  async execute(interaction) {
    await interaction.deferReply();
    const client = interaction.client;
    const guilds = client.guilds.cache.size;
    const commands = client.commands.size;
    const uptime = Math.floor(client.uptime / 1000);
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const embed = modEmbed({
      title: 'Battlegroundians Manager',
      desc: 'A moderation and ticket management bot for **Battlegroundians**.\n\nBuilt with discord.js v14, featuring a full moderation suite, automatic ticket system, and server management tools.',
      thumb: client.user.displayAvatarURL(),
      fields: [
        { name: 'Developer', value: '**Marihuanaplant**', inline: true },
        { name: 'Servers', value: `${guilds}`, inline: true },
        { name: 'Commands', value: `${commands}`, inline: true },
        { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
        { name: 'Features', value: [
          '• Moderation (ban, kick, timeout, warn, etc.)',
          '• Ticket system (support, reports, applications)',
          '• Channel management (lock, slowmode, nuke, purge)',
          '• Voice moderation (mute, deafen, move)',
          '• Info & stats (userinfo, serverinfo, charts)',
          '• Warning system with auto-escalation',
        ].join('\n') },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
