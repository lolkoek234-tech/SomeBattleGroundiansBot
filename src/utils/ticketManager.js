import { PermissionFlagsBits, ChannelType, EmbedBuilder, Colors, SeparatorBuilder, TextDisplayBuilder, ActionRowBuilder } from 'discord.js';
import { configManager } from '../configManager.js';
import { buildTicketControls, buildTicketOpener } from './embedBuilder.js';
import { generateTranscript } from './transcript.js';

const TICKET_TYPES = {
  support: 'Support',
  player_report: 'Player Report',
  staff_app: 'Staff Application',
};

const isStaff = (member, config) => {
  return config.staffRoles?.some(roleId => member.roles?.cache?.has(roleId));
};

export const ticketManager = {
  async create(guild, member, type) {
    const config = configManager.get(guild.id);
    if (!config) throw new Error('Server not configured. Run /setup first.');

    const ticketNumber = (config.ticketCounter || 0) + 1;
    await configManager.update(guild.id, { ticketCounter: ticketNumber });

    const category = guild.channels.cache.get(config.categoryId);
    if (!category) throw new Error('Tickets category not found.');

    const staffRoles = config.staffRoles || [];
    const permissionOverwrites = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...staffRoles.map(roleId => ({
        id: roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      })),
    ];

    const channel = await guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites,
      topic: `Ticket #${ticketNumber} | ${TICKET_TYPES[type]} | Created by ${member.user.tag}`,
    });

    await channel.send({ content: `${member}` });
    const ticketMsg = buildTicketOpener(TICKET_TYPES[type], ticketNumber);
    const controls = buildTicketControls();
    await channel.send({ ...ticketMsg, components: [...ticketMsg.components, controls] });

    return channel;
  },

  async claim(interaction) {
    const config = configManager.get(interaction.guild.id);
    if (!config) throw new Error('Server not configured.');
    if (!isStaff(interaction.member, config)) throw new Error('Only staff can claim tickets.');

    if (!interaction.channel.name.match(/^ticket-\d+$/)) throw new Error('This is not a ticket channel.');

    const controls = buildTicketControls(interaction.member.displayName);
    const claimedText = new TextDisplayBuilder().setContent(`## Ticket claimed by ${interaction.member}`);

    await interaction.update({
      components: [
        ...interaction.message.components.slice(0, -1),
        new ActionRowBuilder().addComponents(new SeparatorBuilder().setDivider()),
        new ActionRowBuilder().addComponents(claimedText),
        controls,
      ],
    });
  },

  async close(interaction) {
    const config = configManager.get(interaction.guild.id);
    if (!config) throw new Error('Server not configured.');
    if (!isStaff(interaction.member, config)) throw new Error('Only staff can close tickets.');

    if (!interaction.channel.name.match(/^ticket-\d+$/)) throw new Error('This is not a ticket channel.');

    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
    if (!logChannel) throw new Error('Log channel not found.');

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
