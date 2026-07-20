import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dataPath } from './dataPath.js';

const CASES_DIR = dataPath('moderation', 'cases');

const ensureDir = () => { if (!existsSync(CASES_DIR)) mkdirSync(CASES_DIR, { recursive: true }); };
const path = (guildId) => { ensureDir(); return join(CASES_DIR, `${guildId}.json`); };

const read = (guildId) => {
  try { return JSON.parse(readFileSync(path(guildId), 'utf8')); } catch { return []; }
};
const write = (guildId, data) => {
  writeFileSync(path(guildId), JSON.stringify(data, null, 2));
};

export const caseManager = {
  create(guildId, { type, userId, moderatorId, reason, duration, evidence }) {
    const cases = read(guildId);
    const id = cases.length > 0 ? Math.max(...cases.map(c => c.id)) + 1 : 1;
    const c = { id, type, userId, moderatorId, reason, timestamp: new Date().toISOString(), active: true };
    if (duration) c.duration = duration;
    if (evidence) c.evidence = evidence;
    cases.push(c);
    write(guildId, cases);
    return c;
  },
  get(guildId, id) { return read(guildId).find(c => c.id === id) ?? null; },
  list(guildId, filter = {}) {
    let cases = read(guildId);
    if (filter.userId) cases = cases.filter(c => c.userId === filter.userId);
    if (filter.type) cases = cases.filter(c => c.type === filter.type);
    if (filter.active !== undefined) cases = cases.filter(c => c.active === filter.active);
    return cases.sort((a, b) => b.id - a.id);
  },
  update(guildId, id, data) {
    const cases = read(guildId);
    const idx = cases.findIndex(c => c.id === id);
    if (idx === -1) return null;
    cases[idx] = { ...cases[idx], ...data };
    write(guildId, cases);
    return cases[idx];
  },
  search(guildId, query) {
    const q = query.toLowerCase();
    return read(guildId).filter(c =>
      c.userId.includes(q) || c.moderatorId.includes(q) || (c.reason && c.reason.toLowerCase().includes(q))
    ).slice(0, 25);
  },
};
