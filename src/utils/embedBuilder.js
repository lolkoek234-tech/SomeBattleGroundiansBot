import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SeparatorBuilder, TextDisplayBuilder, ContainerBuilder, SectionBuilder, ThumbnailBuilder, MessageFlags } from 'discord.js';

export const buildTicketPanel = (imageUrl) => {
  const rulesContent = [
    '## Ticket System',
    '',
    '**Rules**',
    '• Be respectful to all staff members',
    '• Do not abuse the ticket system',
    '• Provide as much detail as possible',
    '• Bumping/pinging will not speed up response',
    '• False reports may result in punishment',
  ].join('\n');

  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(rulesContent))
    .addSeparatorComponents(new SeparatorBuilder().setDivider());

  if (imageUrl) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('Select a category below to get started.'))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(imageUrl));
    container.addSectionComponents(section);
    container.addSeparatorComponents(new SeparatorBuilder().setDivider());
  }

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId('ticket_type_select')
    .setPlaceholder('Select a ticket type...')
    .addOptions([
      { label: 'Support', value: 'support', description: 'Get help with server issues' },
      { label: 'Player Report', value: 'player_report', description: 'Report a player for rule violations' },
      { label: 'Staff Application', value: 'staff_app', description: 'Apply for a staff position' },
    ]);

  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(dropdown),
  );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container.toJSON()],
  };
};

export const buildTicketOpener = (type, ticketNumber) => {
  const container = new ContainerBuilder()
    .setAccentColor(0x57F287)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## Ticket #${ticketNumber} — ${type}\nA staff member will be with you shortly. Please describe your issue.`,
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger),
      ),
    );

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container.toJSON()],
  };
};
