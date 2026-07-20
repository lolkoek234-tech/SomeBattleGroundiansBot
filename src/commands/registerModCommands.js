import { readdirSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');

export const loadModCommands = async (client) => {
  const categories = ['punishments', 'channel', 'info', 'voice', 'settings'];
  const commands = [];

  for (const cat of categories) {
    const dir = join(__dirname, 'commands', 'moderation', cat);
    let files;
    try { files = readdirSync(dir).filter(f => f.endsWith('.js')); } catch { continue; }
    for (const file of files) {
      const mod = await import(`./commands/moderation/${cat}/${file}`);
      const cmd = mod.default;
      if (cmd?.data?.name) {
        client.commands.set(cmd.data.name, cmd);
        commands.push(cmd.data.toJSON());
      }
    }
  }
  return commands;
};
