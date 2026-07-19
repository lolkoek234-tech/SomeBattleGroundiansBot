import { config } from 'dotenv';
config();
import { Client, GatewayIntentBits, REST, Routes, Collection } from 'discord.js';
import { handleTicketDropdown } from './src/interactions/ticketDropdown.js';
import { handleClaimButton } from './src/interactions/claimButton.js';
import { handleCloseButton } from './src/interactions/closeButton.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const registerCommands = async () => {
  try {
    const setupCmd = (await import('./src/commands/setup.js')).default;
    client.commands.set(setupCmd.data.name, setupCmd);

    const commands = [setupCmd.data.toJSON()];
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  } catch (err) {
    console.warn('Command registration failed:', err.message);
  }
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        const reply = { content: '❌ An error occurred.', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    }
    return;
  }

  const handlers = [handleTicketDropdown, handleClaimButton, handleCloseButton];
  for (const handler of handlers) {
    try {
      const handled = await handler(interaction);
      if (handled) break;
    } catch (err) {
      console.error('Handler error:', err);
      break;
    }
  }
});

client.login(process.env.BOT_TOKEN).catch(err => {
  console.error('Failed to login:', err.message);
  process.exit(1);
});

process.on('SIGINT', () => { client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { client.destroy(); process.exit(0); });
