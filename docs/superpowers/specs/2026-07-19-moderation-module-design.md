# Moderation Module Design

## Overview
A high-end moderation system with 30+ slash commands, case tracking, warning escalation, chart-based server stats, and full audit logging. Uses the same Component V2 patterns as the ticket system.

## Architecture

### File Structure
```
src/commands/moderation/
  punishments/{ban, kick, timeout, warn, softban, forcenick, tempban, removewarn, clearwarns}.js
  channel/{lock, unlock, lockall, unlockall, slowmode, slowmodeoff, nuke, purge}.js
  info/{serverstats, userinfo, serverinfo, modlogs, case, casesearch, warnings, history}.js
  voice/{voicemute, voicedeafen, voicekick, moveall}.js
  settings/{modconfig, banlist, note, massrole, appealdeny, warnconfig}.js
src/utils/
  modManager.js       — execute punishment actions, create case records
  caseManager.js      — CRUD on cases.json (per-guild)
  modLog.js           — send formatted embed to mod-log channel
  chartGenerator.js   — chart.js → Canvas → PNG buffer
src/interactions/
  modButtons.js       — confirm/cancel buttons for destructive actions
  modAppealModal.js   — appeal form modal
```

### Data Storage
- `data/moderation/cases/{guildId}.json` — array of case objects
- `data/moderation/configs/{guildId}.json` — per-guild config (log channel, mute role, auto-escalation rules)
- `data/moderation/warnings/{guildId}.json` — warning records per user

### Case Object
```ts
{
  id: number,
  type: 'ban' | 'tempban' | 'kick' | 'timeout' | 'warn' | 'softban' | 'forcenick' | 'note',
  userId: string,
  moderatorId: string,
  reason: string,
  timestamp: string (ISO),
  duration?: number (ms, for temp actions),
  active: boolean,
  evidence?: string (URL),
  dm_success?: boolean
}
```

## Command List (41 total)

### Punishments (9)
- `/ban <user> [reason] [delete_days] [evidence]` — permanent ban
- `/tempban <user> <duration> [reason] [evidence]` — ban with auto-unban
- `/kick <user> [reason]` — kick member
- `/timeout <user> <duration> [reason]` — timeout member
- `/removetimeout <user>` — remove timeout
- `/warn <user> <reason> [evidence]` — add warning, auto-escalate if configured
- `/removewarn <user> <case_id>` — remove a specific warning
- `/clearwarns <user>` — clear all warnings
- `/softban <user> [reason]` — kick + delete messages

### Mod Actions (4)
- `/forcenick <user> <nickname>` — force change nickname
- `/massrole <users> <role> <add|remove>` — bulk role operation
- `/note <user> <content>` — add internal note to user's record
- `/history <user>` — full action history (cases, warnings, notes)

### Channel (8)
- `/lock [channel] [reason]` — deny send messages for @everyone
- `/unlock [channel]` — re-allow send messages
- `/lockall [reason]` — lock all text channels
- `/unlockall` — unlock all text channels
- `/slowmode <seconds>` — set slowmode
- `/slowmode off` — disable slowmode
- `/nuke` — clone channel, delete original, reposition
- `/purge <amount> [user] [filter]` — bulk delete messages

### Info (7)
- `/serverstats` — generated chart image (member growth, activity, roles, channels) as PNG
- `/userinfo <user>` — detailed user info with join date, roles, warnings
- `/serverinfo` — server info with stats
- `/modlogs [user]` — list recent cases, filterable by user
- `/case <case_id>` — view single case details
- `/casesearch <query>` — search cases by reason/user/mod
- `/warnings <user>` — list all warnings for a user

### Voice (4)
- `/voicemute <user>` — server voice mute
- `/voicedeafen <user>` — server voice deafen
- `/voicekick <user>` — disconnect from voice
- `/moveall <source_channel> <target_channel>` — move all members

### Settings (5)
- `/modconfig logchannel <channel>` — set mod log channel
- `/modconfig muterole <role>` — set mute role (if needed)
- `/banlist` — list active bans with filter/search
- `/appealdeny <case_id> [reason]` — deny appeal
- `/warnconfig <max_warns> <action>` — auto-escalation (e.g., 3 warns → timeout 1h)

### Confirmations
- Destructive actions (ban, kick, purge > 10, nuke) require a **confirm/cancel** button pair before execution
- The confirmation message uses Component V2 with a Container and embed-like layout

## Charts (serverstats)
- `chartjs-node-canvas` renders charts server-side
- Charts: member count timeline (7/30 days), top roles by size, channel distribution, activity by hour
- Output: Canvas → PNG Buffer → Discord attachment
- Charts rendered on demand (not cached)

## Dynamic Command Loading
- `index.js` scans `src/commands/moderation/**/*.js` and registers all slash commands
- Each file exports `{ data: SlashCommandBuilder, async execute(interaction) }`
- No manual registration needed per command

## Implementation Order
1. Scaffold: command loader, data directories, utility modules (caseManager, modLog, chartGenerator)
2. Info commands (simplest, no destructive power): userinfo, serverinfo, warnings, history, modlogs, case, casesearch
3. Punishment commands: ban, kick, timeout, warn, softban, forcenick (+ confirmation system)
4. Channel commands: lock, unlock, slowmode, nuke, purge
5. Voice commands
6. Settings commands: modconfig, warnconfig, banlist
7. Advanced: tempban, lockall/unlockall, massrole, appealdeny
8. Charts: serverstats with chart.js rendering
