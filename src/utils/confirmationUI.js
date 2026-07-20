import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export async function confirmationUI(interaction, options = {}) {
  const {
    content = 'Are you sure?',
    confirmLabel = 'Confirm',
    confirmStyle = ButtonStyle.Danger,
    denyLabel = 'Cancel',
    denyStyle = ButtonStyle.Secondary,
    timeout = 30000,
  } = options;

  const confirm = new ButtonBuilder()
    .setCustomId('confirm_yes')
    .setLabel(confirmLabel)
    .setStyle(confirmStyle);

  const deny = new ButtonBuilder()
    .setCustomId('confirm_no')
    .setLabel(denyLabel)
    .setStyle(denyStyle);

  const row = new ActionRowBuilder().addComponents(confirm, deny);

  const reply = await interaction.editReply({ content, components: [row] });

  try {
    const collected = await reply.awaitMessageComponent({
      filter: i => i.user.id === interaction.user.id && (i.customId === 'confirm_yes' || i.customId === 'confirm_no'),
      componentType: ComponentType.Button,
      time: timeout,
    });

    await collected.deferUpdate();
    return collected.customId === 'confirm_yes';
  } catch {
    await interaction.editReply({ content: '⏰ Confirmation timed out.', components: [] });
    return false;
  }
}
