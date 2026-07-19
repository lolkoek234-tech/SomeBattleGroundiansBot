# Ticket Bot — Design Spec

## Overview
Discord ticket bot with Embed V2, built with discord.js v14. Hosted on Railway, code on GitHub.

## Commands
- `/setup` — Transforms current channel into ticket panel. Creates "Tickets" category + `ticket-logs` channel. Prompts for staff role pings. Posts the embed + button + dropdown.

## Embed V2 Layout
- Title: "🎫 Ticket System"
- Divider line
- Rules list (generic: be respectful, no abuse, provide details, don't bump, false reports = punishable)
- User's support card image
- Divider line
- Footer text: "Select a category below to begin"
- Button: "Create Ticket" — opens ephemeral StringSelectMenu
- Dropdown options: Support, Player Report, Staff Application

## Ticket Flow
1. User clicks button → dropdown appears
2. User selects option → private channel created in "Tickets" category
3. Channel named `ticket-{number}` — visible to user + staff roles
4. System post: "Ticket created by @user | Type: Support/Report/Application"
5. Inside ticket: Claim button + Close button

## Inside Ticket Actions
- **Claim** — Assigns ticket to staff member, changes button to "Close"
- **Close** — Only available after claim. Generates transcript, sends to `ticket-logs` channel, deletes ticket channel.

## Storage
- `src/config.json` — Per-guild: staffRoles[], ticketChannelId, categoryId, logChannelId, ticketCounter

## File Structure
```
index.js
package.json
.env
src/
  commands/setup.js
  interactions/ticketButton.js
  interactions/ticketDropdown.js
  interactions/claimButton.js
  interactions/closeButton.js
  utils/embedBuilder.js
  utils/ticketManager.js
  utils/transcript.js
  configManager.js
  config.json
assets/
  support_card.png
```
