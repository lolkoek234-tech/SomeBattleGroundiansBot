# Ticket Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Discord ticket bot with Embed V2, dropdown selection, claim/close system, and transcript logging.

**Architecture:** discord.js v14 with slash commands. JSON file storage for per-guild config. Interactions handled via collectors on the main embed.

**Tech Stack:** Node.js, discord.js v14, Discord Embed V2 builders

---
### Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `package.json`
- Create: `.env`
- Create: `.gitignore`
- Create: `index.js` (skeleton)
- Create: `src/config.json` (empty object)
- Create: `assets/` directory (user copies support_card.png here later)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "somebattlegroundians-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "discord.js": "^14.16.0"
  }
}
```

- [ ] **Step 2: Create .env**

```
BOT_TOKEN=your_bot_token_here
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
.env
```

- [ ] **Step 4: Create index.js skeleton**

```js
import { Client, GatewayIntentBits, REST, Routes, Collection } from 'discord.js';
import { readFileSync } from 'fs';
import { configManager } from './src/configManager.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const registerCommands = async () => {
  const commands = [
    (await import('./src/commands/setup.js')).default.toJSON(),
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  registerCommands();
});

client.login(process.env.BOT_TOKEN);
```

- [ ] **Step 5: Create src/configManager.js**

```js
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config.json');

const ensureConfig = () => {
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, '{}', 'utf-8');
  }
};

export const configManager = {
  get(guildId) {
    ensureConfig();
    const data = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    return data[guildId] || null;
  },
  set(guildId, config) {
    ensureConfig();
    const data = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    data[guildId] = config;
    writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
  },
  update(guildId, partial) {
    const existing = this.get(guildId) || {};
    this.set(guildId, { ...existing, ...partial });
  }
};
```

- [ ] **Step 6: Create assets directory (user copies the image later)**

```bash
mkdir assets
```

- [ ] **Step 7: Install dependencies**

```bash
npm install
```

---
### Task 2: Embed Builder Utility

**Files:**
- Create: `src/utils/embedBuilder.js`

- [ ] **Step 1: Create embedBuilder.js**

```js
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export const buildTicketPanel = (imageUrl) => {
  const embed = new EmbedBuilder()
    .setTitle('🎫 Ticket System')
    .setColor(0x5865F2)
    .addFields(
      { name: '\u200b', value: '═══════════════════════════════', inline: false },
      { name: '📋 Rules', value: [
        '• Be respectful to all staff members',
        '• Do not abuse the ticket system',
        '• Provide as much detail as possible',
        '• Bumping/pinging will not speed up response',
        '• False reports may result in punishment',
      ].join('\n'), inline: false },
      { name: '\u200b', value: '═══════════════════════════════', inline: false },
    )
    .setImage(imageUrl)
    .setFooter({ text: 'Select a category below to begin' });

  const button = new ButtonBuilder()
    .setCustomId('create_ticket')
    .setLabel('Create Ticket')
    .setStyle(ButtonStyle.Success)
    .setEmoji('🎫');

  const row = new ActionRowBuilder().addComponents(button);

  return { embed, components: [row] };
};

export const buildTicketCategoryEmbed = (type, ticketNumber) => {
  return new EmbedBuilder()
    .setTitle(`Ticket #${ticketNumber} — ${type}`)
    .setColor(0x5865F2)
    .setDescription('Staff will be with you shortly. Please describe your issue.')
    .setTimestamp();
};

export const buildDropdown = () => {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_type_select')
    .setPlaceholder('Select a ticket type...')
    .addOptions([
      { label: 'Support', value: 'support', emoji: '❓', description: 'Get help with server-related issues' },
      { label: 'Player Report', value: 'player_report', emoji: '🚨', description: 'Report a player for rule violations' },
      { label: 'Staff Application', value: 'staff_app', emoji: '📝', description: 'Apply for a staff position' },
    ]);

  return new ActionRowBuilder().addComponents(menu);
};

export const buildTicketControls = (claimedBy = null) => {
  const claimBtn = new ButtonBuilder()
    .setCustomId('claim_ticket')
    .setLabel(claimedBy ? `Claimed by ${claimedBy}` : 'Claim Ticket')
    .setStyle(claimedBy ? ButtonStyle.Secondary : ButtonStyle.Primary)
    .setEmoji('🙋')
    .setDisabled(!!claimedBy);

  const closeBtn = new ButtonBuilder()
    .setCustomId('close_ticket')
    .setLabel('Close Ticket')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🔒')
    .setDisabled(!claimedBy);

  return new ActionRowBuilder().addComponents(claimBtn, closeBtn);
};
```

---
### Task 3: ConfigManager & TicketManager Utilities

**Files:**
- Create: `src/utils/ticketManager.js`

- [ ] **Step 1: Create ticketManager.js**

```js
import { PermissionFlagsBits, ChannelType, EmbedBuilder, Colors } from 'discord.js';
import { configManager } from '../configManager.js';
import { buildTicketControls, buildTicketCategoryEmbed } from './embedBuilder.js';
import { generateTranscript } from './transcript.js';

const TICKET_TYPES = {
  support: 'Support',
  player_report: 'Player Report',
  staff_app: 'Staff Application',
};

export const ticketManager = {
  async create(guild, member, type) {
    const config = configManager.get(guild.id);
    if (!config) throw new Error('Server not configured. Run /setup first.');

    const ticketNumber = (config.ticketCounter || 0) + 1;
    configManager.update(guild.id, { ticketCounter: ticketNumber });

    const category = guild.channels.cache.get(config.categoryId);
    if (!category) throw new Error('Tickets category not found.');

    const staffRoles = config.staffRoles || [];
    const permissionOverwrites = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...staffRoles.map(roleId => ({
        id: roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      })),
    ];

    const channel = await guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites,
      topic: `Ticket #${ticketNumber} | ${TICKET_TYPES[type]} | Created by ${member.user.tag}`,
    });

    const embed = buildTicketCategoryEmbed(TICKET_TYPES[type], ticketNumber);
    const controls = buildTicketControls();
    await channel.send({ content: `${member}`, embeds: [embed], components: [controls] });

    return channel;
  },

  async claim(interaction) {
    const config = configManager.get(interaction.guild.id);
    if (!config) throw new Error('Server not configured.');

    const ticketMatch = interaction.channel.name.match(/^ticket-(\d+)$/);
    if (!ticketMatch) throw new Error('This is not a ticket channel.');

    const controls = buildTicketControls(interaction.member.displayName);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(`✅ Ticket claimed by ${interaction.member}`)
      .setTimestamp();

    await interaction.update({ embeds: [interaction.message.embeds[0], embed], components: [controls] });
  },

  async close(interaction) {
    const config = configManager.get(interaction.guild.id);
    if (!config) throw new Error('Server not configured.');

    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
    if (!logChannel) throw new Error('Log channel not found.');

    await interaction.deferUpdate();

    const transcript = await generateTranscript(interaction.channel);
    const embed = new EmbedBuilder()
      .setTitle(`Ticket Closed — ${interaction.channel.name}`)
      .setColor(Colors.Red)
      .addFields(
        { name: 'Created by', value: interaction.channel.topic?.split('|').pop()?.trim() || 'Unknown', inline: true },
        { name: 'Closed by', value: interaction.member.displayName, inline: true },
        { name: 'Channel', value: interaction.channel.name, inline: true },
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed], files: [transcript] });
    await interaction.channel.delete();
  }
};
```

---
### Task 4: Transcript Generator

**Files:**
- Create: `src/utils/transcript.js`

- [ ] **Step 1: Create transcript.js**

```js
import { AttachmentBuilder } from 'discord.js';

export const generateTranscript = async (channel) => {
  const messages = [];
  let lastId = null;

  for (let i = 0; i < 3; i++) {
    const fetched = await channel.messages.fetch({ limit: 100, ...(lastId ? { before: lastId } : {}) });
    if (fetched.size === 0) break;
    messages.push(...fetched.values());
    lastId = fetched.last().id;
  }

  const sorted = messages.reverse();
  const lines = sorted.map(m => {
    const time = m.createdAt.toISOString();
    const author = `${m.author.username}#${m.author.discriminator}`;
    const content = m.content || '(no text content)';
    const attachments = m.attachments.size > 0 ? ` [${m.attachments.map(a => a.url).join(', ')}]` : '';
    return `[${time}] ${author}: ${content}${attachments}`;
  });

  const transcriptContent = [
    `Ticket Transcript — ${channel.name}`,
    `Server: ${channel.guild.name}`,
    `Date: ${new Date().toISOString()}`,
    `${'='.repeat(50)}`,
    ...lines,
  ].join('\n');

  return new AttachmentBuilder(Buffer.from(transcriptContent, 'utf-8'), { name: `transcript-${channel.name}.txt` });
};
```

---
### Task 5: Setup Command

**Files:**
- Create: `src/commands/setup.js`

- [ ] **Step 1: Create setup.js**

```js
import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { configManager } from '../configManager.js';
import { buildTicketPanel, buildDropdown } from '../utils/embedBuilder.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the ticket system in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.editReply('You need Manage Channels permission to run setup.');
    }

    await interaction.editReply('Please mention the staff roles that should have access to tickets (e.g. @Admin @Mod). Type "done" when finished.');

    const filter = (msg) => msg.author.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).catch(() => null);
    if (!collected) return interaction.editReply('Setup timed out. Run /setup again.');

    const msg = collected.first();
    const staffRoles = msg.mentions.roles.map(r => r.id);
    if (staffRoles.length === 0) return interaction.editReply('No roles mentioned. Run /setup again and mention at least one staff role.');

    let category = interaction.guild.channels.cache.find(c => c.name === 'Tickets' && c.type === ChannelType.GuildCategory);
    if (!category) {
      category = await interaction.guild.channels.create({
        name: 'Tickets',
        type: ChannelType.GuildCategory,
      });
    }

    let logChannel = interaction.guild.channels.cache.find(c => c.name === 'ticket-logs' && c.parentId === category.id);
    if (!logChannel) {
      logChannel = await interaction.guild.channels.create({
        name: 'ticket-logs',
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          ...staffRoles.map(roleId => ({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] })),
        ],
      });
    }

    const imageUrl = 'attachment://support_card.png';
    const { embed, components } = buildTicketPanel(imageUrl);

    const panelMsg = await interaction.channel.send({
      embeds: [embed],
      components: [...components],
      files: ['./assets/support_card.png'],
    });

    configManager.set(interaction.guild.id, {
      staffRoles,
      ticketChannelId: interaction.channel.id,
      categoryId: category.id,
      logChannelId: logChannel.id,
      ticketCounter: 0,
      panelMessageId: panelMsg.id,
    });

    await interaction.editReply('✅ Ticket system is set up!');
  }
};
```

---
### Task 6: Interaction Handlers

**Files:**
- Create: `src/interactions/ticketButton.js`
- Create: `src/interactions/ticketDropdown.js`
- Create: `src/interactions/claimButton.js`
- Create: `src/interactions/closeButton.js`
- Modify: `index.js` (add interaction handling)

- [ ] **Step 1: Create ticketButton.js**

```js
import { buildDropdown } from '../utils/embedBuilder.js';

export const handleTicketButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'create_ticket') return false;

  const dropdown = buildDropdown();
  await interaction.reply({ content: 'Select a ticket type:', components: [dropdown], ephemeral: true });
  return true;
};
```

- [ ] **Step 2: Create ticketDropdown.js**

```js
import { ticketManager } from '../utils/ticketManager.js';

export const handleTicketDropdown = async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket_type_select') return false;

  const type = interaction.values[0];
  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await ticketManager.create(interaction.guild, interaction.member, type);
    await interaction.editReply(`✅ Ticket created! Check ${channel}`);
  } catch (err) {
    await interaction.editReply(`❌ ${err.message}`);
  }
  return true;
};
```

- [ ] **Step 3: Create claimButton.js**

```js
import { ticketManager } from '../utils/ticketManager.js';

export const handleClaimButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'claim_ticket') return false;

  try {
    await ticketManager.claim(interaction);
  } catch (err) {
    await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
  }
  return true;
};
```

- [ ] **Step 4: Create closeButton.js**

```js
import { ticketManager } from '../utils/ticketManager.js';

export const handleCloseButton = async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'close_ticket') return false;

  try {
    await ticketManager.close(interaction);
  } catch (err) {
    await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
  }
  return true;
};
```

- [ ] **Step 5: Update index.js with interaction handling**

```js
import { Client, GatewayIntentBits, REST, Routes, Collection } from 'discord.js';
import { configManager } from './src/configManager.js';
import { handleTicketButton } from './src/interactions/ticketButton.js';
import { handleTicketDropdown } from './src/interactions/ticketDropdown.js';
import { handleClaimButton } from './src/interactions/claimButton.js';
import { handleCloseButton } from './src/interactions/closeButton.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const registerCommands = async () => {
  try {
    const commands = [
      (await import('./src/commands/setup.js')).default.data.toJSON(),
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Commands registered');
  } catch (err) {
    console.error('Failed to register commands:', err);
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
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: '❌ An error occurred.', ephemeral: true });
        } else {
          await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
        }
      }
    }
    return;
  }

  const handlers = [handleTicketButton, handleTicketDropdown, handleClaimButton, handleCloseButton];
  for (const handler of handlers) {
    const handled = await handler(interaction).catch(err => {
      console.error('Handler error:', err);
      return false;
    });
    if (handled) break;
  }
});

client.login(process.env.BOT_TOKEN);
```

---
### Task 7: Final Wiring & Testing

**Files:**
- Modify: `index.js` (ensure commands collection is populated)
- Verify: Manual walkthrough

- [ ] **Step 1: Ensure commands are loaded on startup**

Update `index.js` — after registering commands, also populate `client.commands`:

At the top of `registerCommands`, add:
```js
import setupCmd from './src/commands/setup.js';
client.commands.set(setupCmd.data.name, setupCmd);
```

- [ ] **Step 2: Verify the project can start**

```bash
node --check index.js
```

Expected: No output (syntax is valid).

- [ ] **Step 3: Final commit (if user confirms)**

```bash
git init
git add -A
git commit -m "feat: ticket bot with embed V2, dropdown, claim/close, transcripts"
```

- [ ] **Step 4: Push to GitHub**

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

- [ ] **Step 5: Railway deployment**

1. Connect GitHub repo to Railway
2. Add `BOT_TOKEN` environment variable
3. Deploy — the bot will start and register slash commands
