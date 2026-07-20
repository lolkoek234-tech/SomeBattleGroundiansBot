import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { dataPath } from './dataPath.js';

const DIR = dataPath('moderation', 'warnings');
const ensure = () => { if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true }); };
const path = (guildId) => { ensure(); return join(DIR, `${guildId}.json`); };

export const warnManager = {
  list(guildId, userId) {
    try {
      const warns = JSON.parse(readFileSync(path(guildId), 'utf8'));
      return warns.filter(w => w.userId === userId);
    } catch { return []; }
  },
  all(guildId) {
    try { return JSON.parse(readFileSync(path(guildId), 'utf8')); } catch { return []; }
  },
  remove(guildId, userId, index) {
    const warns = this.all(guildId);
    const filtered = warns.filter(w => w.userId === userId);
    const target = filtered[index];
    if (!target) return null;
    const idx = warns.indexOf(target);
    warns.splice(idx, 1);
    writeFileSync(path(guildId), JSON.stringify(warns, null, 2));
    return target;
  },
  clear(guildId, userId) {
    const warns = this.all(guildId);
    const remaining = warns.filter(w => w.userId !== userId);
    writeFileSync(path(guildId), JSON.stringify(remaining, null, 2));
  },
};
