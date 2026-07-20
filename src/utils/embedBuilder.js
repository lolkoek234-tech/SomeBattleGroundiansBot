import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SeparatorBuilder, TextDisplayBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags } from 'discord.js';

const ALL_TICKET_OPTIONS = [
  { label: 'Support', value: 'support', emojiKey: 'support', description: 'Get help with server issues' },
  { label: 'Player Report', value: 'player_report', emojiKey: 'player_report', description: 'Report a player for rule violations' },
  { label: 'Content Creator Application', value: 'content_creator', emojiKey: 'content_creator', description: 'Apply for content creator' },
  { label: 'Staff Application', value: 'staff_application', emojiKey: 'staff_application', description: 'Apply for staff position' },
  { label: 'Tester Application', value: 'tester_application', emojiKey: 'tester_application', description: 'Apply to be a tester' },
];

export const buildTicketPanel = (bannerUrl, emojis = {}, enabledTypes = {}) => {
  const container = new ContainerBuilder()
    .setAccentColor(0x8B0000)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent([
      '## Battlegroundians Ticket Support',
      '',
      'If you require assistance, please select an option below.',
    ].join('\n')))
    .addSeparatorComponents(new SeparatorBuilder().setDivider());

  if (bannerUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(bannerUrl),
      ),
    );
    container.addSeparatorComponents(new SeparatorBuilder().setDivider());
  }

  const options = ALL_TICKET_OPTIONS
    .filter(o => enabledTypes[o.value] !== false)
    .map(o => ({ label: o.label, value: o.value, emoji: emojis[o.emojiKey], description: o.description }));

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId('ticket_type_select')
    .setPlaceholder('Select a ticket type...')
    .addOptions(options);

  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(dropdown),
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('-# *Battlegroundians support team*'),
  );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container.toJSON()],
  };
};

export const buildTicketOpener = (type, ticketNumber, claimedBy) => {
  const lines = [`## Ticket #${ticketNumber} — ${type}`];
  lines.push('A staff member will be with you shortly. Please describe your issue.');

  const container = new ContainerBuilder()
    .setAccentColor(0x8B0000)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(lines.join('\n')),
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider());

  if (claimedBy) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## Ticket claimed by ${claimedBy}`),
    );
    container.addSeparatorComponents(new SeparatorBuilder().setDivider());
  }

  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Secondary),
    ),
  );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container.toJSON()],
  };
};
