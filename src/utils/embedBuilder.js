import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export const buildTicketPanel = (imageUrl) => {
  const embed = new EmbedBuilder()
    .setTitle('Ticket System')
    .setColor(0x5865F2)
    .addFields(
      { name: '\u200b', value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━', inline: false },
      { name: 'Rules', value: [
        'Be respectful to all staff members',
        'Do not abuse the ticket system',
        'Provide as much detail as possible',
        'Bumping/pinging will not speed up response',
        'False reports may result in punishment',
      ].join('\n'), inline: false },
      { name: '\u200b', value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━', inline: false },
    )
    .setImage(imageUrl);

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId('ticket_type_select')
    .setPlaceholder('Select a ticket type...')
    .addOptions([
      { label: 'Support', value: 'support', description: 'Get help with server issues' },
      { label: 'Player Report', value: 'player_report', description: 'Report a player for rule violations' },
      { label: 'Staff Application', value: 'staff_app', description: 'Apply for a staff position' },
    ]);

  return { embed, components: [new ActionRowBuilder().addComponents(dropdown)] };
};

export const buildTicketMessage = (type, ticketNumber, member) => {
  const embed = new EmbedBuilder()
    .setTitle(`Ticket #${ticketNumber} — ${type}`)
    .setColor(0x5865F2)
    .setDescription('Staff will be with you shortly. Please describe your issue.')
    .setTimestamp();

  return { content: `${member}`, embeds: [embed] };
};

export const buildTicketControls = (claimedBy = null) => {
  const claimBtn = new ButtonBuilder()
    .setCustomId('claim_ticket')
    .setLabel(claimedBy ? `Claimed by ${claimedBy}` : 'Claim Ticket')
    .setStyle(claimedBy ? ButtonStyle.Secondary : ButtonStyle.Primary)
    .setEmoji('🙋')
    .setDisabled(!!claimedBy);

  const closeBtn = new ButtonBuilder()
    .setCustomId('close_ticket')
    .setLabel('Close Ticket')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🔒')
    .setDisabled(!claimedBy);

  return new ActionRowBuilder().addComponents(claimBtn, closeBtn);
};
