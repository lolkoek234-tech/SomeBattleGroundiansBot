import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = process.env.CONFIG_PATH
  ? join(process.env.CONFIG_PATH, 'config.json')
  : join(__dirname, '..', 'data', 'config.json');

const dir = dirname(CONFIG_PATH);
if (!existsSync(dir)) {
  try { mkdirSync(dir, { recursive: true }); } catch {}
}

const readConfig = () => {
  try {
    if (!existsSync(CONFIG_PATH)) return {};
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
};

const writeConfig = (data) => {
  try {
    const dir = dirname(CONFIG_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write config:', err.message);
  }
};

export const configManager = {
  get(guildId) {
    const data = readConfig();
    return data[guildId] || null;
  },
  set(guildId, config) {
    const data = readConfig();
    data[guildId] = config;
    writeConfig(data);
  },
  update(guildId, partial) {
    const existing = this.get(guildId) || {};
    this.set(guildId, { ...existing, ...partial });
  }
};
