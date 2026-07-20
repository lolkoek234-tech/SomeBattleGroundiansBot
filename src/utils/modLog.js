import { EmbedBuilder, Colors } from 'discord.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { caseManager } from './caseManager.js';

const readConfig = (guildId) => {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'data', 'moderation', 'configs', `${guildId}.json`), 'utf8'));
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

  const typeColors = {
    ban: Colors.Red, tempban: Colors.Orange, kick: Colors.Orange,
    timeout: Colors.Yellow, warn: Colors.Yellow, softban: Colors.Orange,
    forcenick: Colors.Grey, note: Colors.Grey, unlock: Colors.Green,
    lock: Colors.Red, slowmode: Colors.Grey, nuke: Colors.Red,
    purge: Colors.Red, voicemute: Colors.Grey, voicedeafen: Colors.Grey,
    voicekick: Colors.Orange, moveall: Colors.Grey,
    unban: Colors.Green, removetimeout: Colors.Green,
  };

  const embed = new EmbedBuilder()
    .setColor(typeColors[caseRecord.type] || Colors.Blurple)
    .setTitle(`Case #${caseRecord.id} — ${caseRecord.type.toUpperCase()}`)
    .addFields(
      { name: 'User', value: `<@${caseRecord.userId}>`, inline: true },
      { name: 'Moderator', value: `<@${caseRecord.moderatorId}>`, inline: true },
      { name: 'Reason', value: caseRecord.reason || 'No reason provided' },
    )
    .setTimestamp();

  if (caseRecord.duration) {
    embed.addFields({ name: 'Duration', value: ms(caseRecord.duration), inline: true });
  }
  if (caseRecord.evidence) embed.setImage(caseRecord.evidence);
  if (caseRecord.dm_success === false) embed.setFooter({ text: '⚠ Failed to DM user' });

  await channel.send({ embeds: [embed] });
};
