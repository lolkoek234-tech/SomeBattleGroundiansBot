import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIR = join(process.cwd(), 'data', 'moderation', 'configs');
const ensure = () => { if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true }); };
const path = (guildId) => { ensure(); return join(DIR, `${guildId}.json`); };

export const modConfigManager = {
  get(guildId) {
    try { return JSON.parse(readFileSync(path(guildId), 'utf8')); } catch { return {}; }
  },
  set(guildId, data) {
    const existing = this.get(guildId);
    writeFileSync(path(guildId), JSON.stringify({ ...existing, ...data }, null, 2));
  },
};
