import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, SeparatorBuilder, TextDisplayBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags } from 'discord.js';

export const buildTicketPanel = (images) => {
  const container = new ContainerBuilder()
    .setAccentColor(0x8B0000)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent([
      '## Battlegroundians Ticket Support',
      '',
      'If you require assistance, please select an option below.',
    ].join('\n')))
    .addSeparatorComponents(new SeparatorBuilder().setDivider());

  if (images?.ticketTypes?.length) {
    const gallery = new MediaGalleryBuilder();
    for (const t of images.ticketTypes) {
      gallery.addItems(new MediaGalleryItemBuilder().setURL(t.url).setDescription(t.label));
    }
    container.addMediaGalleryComponents(gallery);
    container.addSeparatorComponents(new SeparatorBuilder().setDivider());
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('-# *Battlegroundians support team*'),
  );

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId('ticket_type_select')
    .setPlaceholder('Select a ticket type...')
    .addOptions([
      { label: 'Support', value: 'support', description: 'Get help with server issues' },
      { label: 'Player Report', value: 'player_report', description: 'Report a player for rule violations' },
      { label: 'Content Creator Application', value: 'content_creator', description: 'Apply for content creator' },
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
