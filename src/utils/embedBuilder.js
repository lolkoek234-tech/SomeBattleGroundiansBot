import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export const buildTicketPanel = (imageUrl) => {
  const embed = new EmbedBuilder()
    .setTitle('🎫 Ticket System')
    .setColor(0x5865F2)
    .addFields(
      { name: '\u200b', value: '═══════════════════════════════', inline: false },
      { name: '📋 Rules', value: [
        '• Be respectful to all staff members',
        '• Do not abuse the ticket system',
        '• Provide as much detail as possible',
        '• Bumping/pinging will not speed up response',
        '• False reports may result in punishment',
      ].join('\n'), inline: false },
      { name: '\u200b', value: '═══════════════════════════════', inline: false },
    )
    .setImage(imageUrl)
    .setFooter({ text: 'Select a category below to begin' });

  const button = new ButtonBuilder()
    .setCustomId('create_ticket')
    .setLabel('Create Ticket')
    .setStyle(ButtonStyle.Success)
    .setEmoji('🎫');

  const row = new ActionRowBuilder().addComponents(button);

  return { embed, components: [row] };
};

export const buildTicketCategoryEmbed = (type, ticketNumber) => {
  return new EmbedBuilder()
    .setTitle(`Ticket #${ticketNumber} — ${type}`)
    .setColor(0x5865F2)
    .setDescription('Staff will be with you shortly. Please describe your issue.')
    .setTimestamp();
};

export const buildDropdown = () => {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_type_select')
    .setPlaceholder('Select a ticket type...')
    .addOptions([
      { label: 'Support', value: 'support', emoji: '❓', description: 'Get help with server-related issues' },
      { label: 'Player Report', value: 'player_report', emoji: '🚨', description: 'Report a player for rule violations' },
      { label: 'Staff Application', value: 'staff_app', emoji: '📝', description: 'Apply for a staff position' },
    ]);

  return new ActionRowBuilder().addComponents(menu);
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
