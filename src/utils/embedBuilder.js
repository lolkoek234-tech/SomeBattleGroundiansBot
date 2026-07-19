import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SeparatorBuilder, TextDisplayBuilder, ContainerBuilder, SectionBuilder, ThumbnailBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags } from 'discord.js';

export const buildTicketPanel = (images) => {
  const container = new ContainerBuilder()
    .setAccentColor(0x8B0000)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent([
      '## Battlegroundians Ticket Support',
      '',
      'If you require assistance, please select an option below.',
    ].join('\n')))
    .addSeparatorComponents(new SeparatorBuilder().setDivider());

  if (images?.banner) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(images.banner),
      ),
    );
    container.addSeparatorComponents(new SeparatorBuilder().setDivider());
  }

  const types = [
    { id: 'support', label: 'Support', desc: 'Get help with server issues', img: images?.ticketTypes?.support },
    { id: 'player_report', label: 'Player Report', desc: 'Report a player for rule violations', img: images?.ticketTypes?.player_report },
    { id: 'content_creator', label: 'Content Creator Application', desc: 'Apply for content creator', img: images?.ticketTypes?.content_creator },
  ];

  for (const t of types) {
    if (t.img) {
      const section = new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${t.label}\n${t.desc}`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(t.img));
      container.addSectionComponents(section);
    }
    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`create_ticket:${t.id}`)
          .setLabel(t.label)
          .setStyle(ButtonStyle.Secondary),
      ),
    );
    container.addSeparatorComponents(new SeparatorBuilder().setDivider());
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('-# *Battlegroundians support team*'),
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
