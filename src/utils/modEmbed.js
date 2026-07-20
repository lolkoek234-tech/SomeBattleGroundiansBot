import { EmbedBuilder } from 'discord.js';

const ACCENT = 0x8B0000;
const FOOTER_TEXT = 'Battlegroundians Moderation';

export const modEmbed = (opts = {}) => {
  const e = new EmbedBuilder()
    .setColor(ACCENT)
    .setTimestamp()
    .setFooter({ text: FOOTER_TEXT });

  if (opts.title) e.setTitle(opts.title);
  if (opts.desc) e.setDescription(opts.desc);
  if (opts.thumb) e.setThumbnail(opts.thumb);
  if (opts.image) e.setImage(opts.image);
  if (opts.fields) e.addFields(opts.fields);
  if (opts.author) e.setAuthor(opts.author);

  return e;
};

export const successEmbed = (desc, opts = {}) => modEmbed({ ...opts, desc: `✅ ${desc}` });

export const errorEmbed = (desc) => modEmbed({ desc: `❌ ${desc}` });
