import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SeparatorBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder } from 'discord.js';

export const buildTicketPanel = (imageUrl) => {
  const separator = new SeparatorBuilder().setDivider();

  const rulesText = new TextDisplayBuilder().setContent([
    '## Rules',
    '',
    'Be respectful to all staff members',
    'Do not abuse the ticket system',
    'Provide as much detail as possible',
    'Bumping/pinging will not speed up response',
    'False reports may result in punishment',
  ].join('\n'));

  const thumb = new ThumbnailBuilder().setURL(imageUrl);
  const section = new SectionBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('\u200b'))
    .setThumbnailAccessory(thumb);

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId('ticket_type_select')
    .setPlaceholder('Select a ticket type...')
    .addOptions([
      { label: 'Support', value: 'support', description: 'Get help with server issues' },
      { label: 'Player Report', value: 'player_report', description: 'Report a player for rule violations' },
      { label: 'Staff Application', value: 'staff_app', description: 'Apply for a staff position' },
    ]);

  return {
    components: [
      new ActionRowBuilder().addComponents(separator),
      new ActionRowBuilder().addComponents(rulesText),
      new ActionRowBuilder().addComponents(separator),
      new ActionRowBuilder().addComponents(section),
      new ActionRowBuilder().addComponents(separator),
      new ActionRowBuilder().addComponents(dropdown),
    ],
  };
};

export const buildTicketMessage = (type, ticketNumber, member) => {
  return {
    content: `${member}`,
    components: [
      new ActionRowBuilder().addComponents(new TextDisplayBuilder().setContent(`## Ticket #${ticketNumber} — ${type}\n\nStaff will be with you shortly. Please describe your issue.`)),
    ],
  };
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
