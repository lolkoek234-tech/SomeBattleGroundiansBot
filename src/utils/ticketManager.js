import { PermissionFlagsBits, ChannelType, EmbedBuilder, Colors, Routes } from 'discord.js';
import { configManager } from '../configManager.js';
import { buildTicketOpener } from './embedBuilder.js';
import { generateTranscript } from './transcript.js';

const TICKET_TYPES = {
  support: 'Support',
  player_report: 'Player Report',
  content_creator: 'Content Creator Application',
};

const isStaff = (member, config) => {
  return config.staffRoles?.some(roleId => member.roles?.cache?.has(roleId));
};

const isTicketChannel = (name) => /^ticket-/.test(name);

export const ticketManager = {
  async create(guild, member, type) {
    const config = configManager.get(guild.id);
    if (!config) throw new Error('Server not configured. Run /setup first.');

    const ticketNumber = (config.ticketCounter || 0) + 1;
    configManager.update(guild.id, { ticketCounter: ticketNumber });

    const category = await guild.channels.fetch(config.categoryId).catch(() => null);
    if (!category) throw new Error('Tickets category not found. It may have been deleted.');

    const staffRoles = config.staffRoles || [];
    const permissionOverwrites = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...staffRoles.map(roleId => ({
        id: roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      })),
    ];

    const safeName = member.user.username.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().slice(0, 80) || `user-${member.id.slice(0, 6)}`;
    const channelName = `ticket-${safeName}`;
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites,
      topic: `Ticket #${ticketNumber} | ${TICKET_TYPES[type]} | Created by ${member.user.tag}`,
    });

    const staffPing = config.staffRoles.map(r => `<@&${r}>`).join(' ');
    await channel.send({ content: `${member} ${staffPing}` });
    const opener = buildTicketOpener(TICKET_TYPES[type], ticketNumber);
    await guild.client.rest.post(Routes.channelMessages(channel.id), {
      body: { flags: 32768, components: opener.components },
    });

    return channel;
  },

  async claim(interaction) {
    const config = configManager.get(interaction.guild.id);
    if (!config) throw new Error('Server not configured. Run /setup first.');
    if (!isStaff(interaction.member, config)) throw new Error('Only staff can claim tickets.');
    if (!isTicketChannel(interaction.channel.name)) throw new Error('This is not a ticket channel.');

    await interaction.deferUpdate();

    const msg = interaction.message;
    const opener = buildTicketOpener(
      interaction.channel.topic?.match(/\| (.+) \|/)?.[1] || 'Ticket',
      parseInt(interaction.channel.topic?.match(/#(\d+)/)?.[1]) || 0,
      interaction.member.displayName,
    );

    await interaction.client.rest.patch(
      Routes.channelMessage(interaction.channelId, msg.id),
      { body: { components: opener.components } },
    );
  },

  async close(interaction) {
    const config = configManager.get(interaction.guild.id);
    if (!config) throw new Error('Server not configured. Run /setup first.');
    if (!isStaff(interaction.member, config)) throw new Error('Only staff can close tickets.');
    if (!isTicketChannel(interaction.channel.name)) throw new Error('This is not a ticket channel.');

    const logChannel = await interaction.guild.channels.fetch(config.logChannelId).catch(() => null);
    if (!logChannel) throw new Error('Log channel not found. It may have been deleted.');

    await interaction.deferUpdate();

    try {
      const transcript = await generateTranscript(interaction.channel);
      const embed = new EmbedBuilder()
        .setTitle(`Ticket Closed — ${interaction.channel.name}`)
        .setColor(Colors.Red)
        .addFields(
          { name: 'Created by', value: interaction.channel.topic?.match(/Created by (.+)$/)?.[1] || 'Unknown', inline: true },
          { name: 'Closed by', value: interaction.member.displayName, inline: true },
          { name: 'Channel', value: interaction.channel.name, inline: true },
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed], files: [transcript] });
    } catch (err) {
      console.error('Failed to save transcript:', err);
    }

    await interaction.channel.delete();
  }
};
