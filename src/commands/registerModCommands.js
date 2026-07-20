import { readdirSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');

export const loadModCommands = async (client) => {
  const categories = ['punishments', 'channel', 'info', 'voice', 'settings'];
  const commands = [];

  for (const cat of categories) {
    const dir = join(__dirname, 'moderation', cat);
    let files;
    try { files = readdirSync(dir).filter(f => f.endsWith('.js')); } catch { continue; }
    for (const file of files) {
      try {
        const mod = await import(`./moderation/${cat}/${file}`);
        const cmd = mod.default;
        if (cmd?.data?.name) {
          client.commands.set(cmd.data.name, cmd);
          commands.push(cmd.data.toJSON());
        }
      } catch (err) {
        console.error(`Failed to load command ${cat}/${file}:`, err.message);
      }
    }
  }
  return commands;
};
