import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SeparatorBuilder, TextDisplayBuilder, MessageFlags } from 'discord.js';

export const buildTicketPanel = (_imageUrl) => {
  const separator = new SeparatorBuilder().setDivider();

  const welcomeText = new TextDisplayBuilder().setContent([
    '## Ticket System',
    '',
    '**Rules**',
    'Be respectful to all staff members',
    'Do not abuse the ticket system',
    'Provide as much detail as possible',
    'Bumping/pinging will not speed up response',
    'False reports may result in punishment',
  ].join('\n'));

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId('ticket_type_select')
    .setPlaceholder('Select a ticket type...')
    .addOptions([
      { label: 'Support', value: 'support', description: 'Get help with server issues' },
      { label: 'Player Report', value: 'player_report', description: 'Report a player for rule violations' },
      { label: 'Staff Application', value: 'staff_app', description: 'Apply for a staff position' },
    ]);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      new ActionRowBuilder().addComponents(separator),
      new ActionRowBuilder().addComponents(welcomeText),
      new ActionRowBuilder().addComponents(separator),
      new ActionRowBuilder().addComponents(dropdown),
    ],
  };
};

export const buildTicketOpener = (type, ticketNumber) => {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      new ActionRowBuilder().addComponents(new SeparatorBuilder().setDivider()),
      new ActionRowBuilder().addComponents(
        new TextDisplayBuilder().setContent(
          `## Ticket #${ticketNumber} — ${type}\n\nStaff will be with you shortly. Please describe your issue.`
        )
      ),
      new ActionRowBuilder().addComponents(new SeparatorBuilder().setDivider()),
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
