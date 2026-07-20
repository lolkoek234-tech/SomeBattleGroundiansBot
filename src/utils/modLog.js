import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { modEmbed } from './modEmbed.js';
import { dataPath } from './dataPath.js';

const readConfig = (guildId) => {
  try {
    return JSON.parse(readFileSync(dataPath('moderation', 'configs', `${guildId}.json`), 'utf8'));
  } catch { return {}; }
};

const ms = (n) => {
  const s = Math.floor(n / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h % 24) parts.push(`${h % 24}h`);
  if (m % 60) parts.push(`${m % 60}m`);
  if (s % 60 || !parts.length) parts.push(`${s % 60}s`);
  return parts.join(' ');
};

export const sendModLog = async (guild, caseRecord) => {
  const config = readConfig(guild.id);
  const channelId = config?.logChannel;
  if (!channelId) return;
  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;

  const embed = modEmbed({
    title: `Case #${caseRecord.id} — ${caseRecord.type.toUpperCase()}`,
    fields: [
      { name: 'User', value: `<@${caseRecord.userId}>`, inline: true },
      { name: 'Moderator', value: `<@${caseRecord.moderatorId}>`, inline: true },
      { name: 'Reason', value: caseRecord.reason || 'No reason provided' },
    ],
  });

  if (caseRecord.duration) {
    embed.addFields({ name: 'Duration', value: ms(caseRecord.duration), inline: true });
  }
  if (caseRecord.evidence) embed.setImage(caseRecord.evidence);
  if (caseRecord.dm_success === false) embed.setFooter({ text: 'Battlegroundians Moderation — ⚠ Failed to DM user' });

  await channel.send({ embeds: [embed] });
};
