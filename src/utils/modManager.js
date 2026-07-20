import { EmbedBuilder } from 'discord.js';
import { caseManager } from './caseManager.js';
import { sendModLog } from './modLog.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const WARN_DIR = join(process.cwd(), 'data', 'moderation', 'warnings');
const DIR = join(process.cwd(), 'data', 'moderation', 'configs');

const ensureWarnDir = () => { if (!existsSync(WARN_DIR)) mkdirSync(WARN_DIR, { recursive: true }); };
const warnPath = (guildId) => { ensureWarnDir(); return join(WARN_DIR, `${guildId}.json`); };
const readWarns = (guildId) => {
  try { return JSON.parse(readFileSync(warnPath(guildId), 'utf8')); } catch { return []; }
};
const writeWarns = (guildId, warns) => writeFileSync(warnPath(guildId), JSON.stringify(warns, null, 2));
const readWarnConfig = (guildId) => {
  try { return JSON.parse(readFileSync(join(DIR, `${guildId}.json`), 'utf8')); } catch { return {}; }
};

const DM_ACTIONS = ['ban', 'tempban', 'kick', 'timeout', 'warn', 'softban'];

const sendDm = async (guild, userId, action, reason, caseId) => {
  try {
    const user = await guild.client.users.fetch(userId).catch(() => null);
    if (!user) return false;
    const embed = new EmbedBuilder()
      .setColor(0x8B0000)
      .setTitle(`You were ${action}ed in ${guild.name}`)
      .setDescription(`**Reason:** ${reason || 'No reason provided'}`)
      .addFields({ name: 'Case ID', value: `#${caseId}`, inline: true })
      .setTimestamp();
    await user.send({ embeds: [embed] });
    return true;
  } catch {
    return false;
  }
};

export const modManager = {
  async execute(guild, action, userId, moderatorId, reason, options = {}) {
    const member = guild.members.cache.get(userId);
    let caseRecord;

    switch (action) {
      case 'ban': {
        await guild.bans.create(userId, { reason, deleteMessageSeconds: options.deleteDays ? options.deleteDays * 86400 : undefined });
        caseRecord = caseManager.create(guild.id, { type: 'ban', userId, moderatorId, reason, evidence: options.evidence });
        break;
      }
      case 'tempban': {
        await guild.bans.create(userId, { reason, deleteMessageSeconds: options.deleteDays ? options.deleteDays * 86400 : undefined });
        caseRecord = caseManager.create(guild.id, { type: 'tempban', userId, moderatorId, reason, duration: options.duration, evidence: options.evidence });
        if (options.duration) {
          setTimeout(async () => {
            try { await guild.bans.remove(userId); } catch {}
          }, options.duration);
        }
        break;
      }
      case 'kick': {
        if (member) await member.kick(reason);
        caseRecord = caseManager.create(guild.id, { type: 'kick', userId, moderatorId, reason });
        break;
      }
      case 'timeout': {
        if (member) await member.timeout(options.duration, reason);
        caseRecord = caseManager.create(guild.id, { type: 'timeout', userId, moderatorId, reason, duration: options.duration });
        break;
      }
      case 'removetimeout': {
        if (member) await member.timeout(null);
        caseRecord = caseManager.create(guild.id, { type: 'removetimeout', userId, moderatorId, reason: reason || 'Timeout removed' });
        break;
      }
      case 'warn': {
        const warns = readWarns(guild.id);
        warns.push({ userId, moderatorId, reason, timestamp: new Date().toISOString(), evidence: options.evidence });
        writeWarns(guild.id, warns);
        caseRecord = caseManager.create(guild.id, { type: 'warn', userId, moderatorId, reason, evidence: options.evidence });
        const warnConfig = readWarnConfig(guild.id);
        if (warnConfig.maxWarns && warns.filter(w => w.userId === userId).length >= warnConfig.maxWarns) {
          const escAction = warnConfig.escalationAction || 'timeout';
          await this.execute(guild, escAction, userId, moderatorId, `Auto-escalation: ${warnConfig.maxWarns} warns reached`);
        }
        break;
      }
      case 'softban': {
        if (member) {
          await member.ban({ reason, deleteMessageSeconds: 604800 });
          await guild.bans.remove(userId);
        }
        caseRecord = caseManager.create(guild.id, { type: 'softban', userId, moderatorId, reason });
        break;
      }
      case 'forcenick': {
        if (member) {
          await member.setNickname(options.nickname, reason);
          caseRecord = caseManager.create(guild.id, { type: 'forcenick', userId, moderatorId, reason });
        }
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (caseRecord) {
      if (DM_ACTIONS.includes(action)) {
        const dmSuccess = await sendDm(guild, userId, action, reason, caseRecord.id);
        if (!dmSuccess) caseRecord.dm_success = false;
      }
      await sendModLog(guild, caseRecord);
    }
    return caseRecord;
  },
};
