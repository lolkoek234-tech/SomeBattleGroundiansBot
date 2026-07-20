import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { modEmbed } from '../utils/modEmbed.js';

const CATEGORY_ORDER = ['punishments', 'channel', 'info', 'voice', 'settings'];
const CATEGORY_LABELS = {
  punishments: '🛠️ Punishments',
  channel: '📋 Channel',
  info: 'ℹ️ Info',
  voice: '🔊 Voice',
  settings: '⚙️ Settings',
};

const cmdCategory = new Map();
const CATEGORY_CMDS = {
  punishments: ['ban', 'tempban', 'kick', 'timeout', 'removetimeout', 'warn', 'softban', 'forcenick'],
  channel: ['lock', 'unlock', 'lockall', 'unlockall', 'slowmode', 'slowmodeoff', 'nuke', 'purge'],
  info: ['userinfo', 'serverinfo', 'modlogs', 'case', 'casesearch', 'warnings', 'history', 'serverstats', 'roles', 'information'],
  voice: ['voicemute', 'voicedeafen', 'voicekick', 'moveall'],
  settings: ['modconfig', 'banlist', 'note', 'massrole', 'warnconfig', 'removewarn', 'clearwarns', 'appealdeny'],
};

function generateUsage(cmd) {
  const name = cmd.data.name;
  const opts = cmd.data.options;
  if (!opts?.length) return `/${name}`;
  if (opts[0]?.type === 1 || opts[0]?.type === 2) {
    const lines = [];
    for (const sub of opts) {
      const subName = sub.name;
      const subOpts = sub.options;
      if (subOpts?.length) {
        const params = subOpts.map(o => o.required ? `<${o.name}>` : `[${o.name}]`).join(' ');
        lines.push(`/${name} ${subName} ${params}`);
      } else {
        lines.push(`/${name} ${subName}`);
      }
    }
    return lines.join('\n');
  }
  const params = opts.map(o => o.required ? `<${o.name}>` : `[${o.name}]`).join(' ');
  return `/${name} ${params}`;
}

function generateExample(cmd) {
  const name = cmd.data.name;
  const opts = cmd.data.options;
  if (!opts?.length) return `/${name}`;
  if (opts[0]?.type === 1) {
    const sub = opts[0];
    const subName = sub.name;
    const req = sub.options?.find(o => o.required);
    return `/${name} ${subName}${req ? ` <${req.name}>` : ''}`;
  }
  const req = opts.find(o => o.required);
  return `/${name}${req ? ` <${req.name}>` : ' [option]'}`;
}

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with bot commands')
    .addStringOption(o => o.setName('command').setDescription('Command name to get help for').setAutocomplete(true)),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const choices = [...interaction.client.commands.keys()].filter(c => c !== 'help' && c.startsWith(focused)).slice(0, 25);
    await interaction.respond(choices.map(c => ({ name: c, value: c })));
  },

  async execute(interaction) {
    const cmdName = interaction.options.getString('command');

    if (cmdName) {
      const cmd = interaction.client.commands.get(cmdName.toLowerCase());
      if (!cmd) return interaction.editReply({ embeds: [modEmbed({ desc: `❌ Command \`${cmdName}\` not found.` })] });

      const embed = modEmbed({
        title: `Command: /${cmd.data.name}`,
        fields: [
          { name: 'Description', value: cmd.data.description || 'No description' },
          { name: 'Cooldown', value: cmd.cooldown ? `${cmd.cooldown}s` : 'None', inline: true },
          { name: 'Usage', value: `\`\`\`${generateUsage(cmd)}\`\`\`` },
          { name: 'Example', value: `\`\`\`${cmd.example || generateExample(cmd)}\`\`\`` },
        ],
      });
      return interaction.editReply({ embeds: [embed] });
    }

    const embed = modEmbed({
      title: 'Battlegroundians Bot Commands',
      desc: 'Use `/help <command>` for details on a specific command.',
    });

    for (const cat of CATEGORY_ORDER) {
      const cmds = CATEGORY_CMDS[cat].filter(c => interaction.client.commands.has(c));
      if (cmds.length) {
        embed.addFields({ name: CATEGORY_LABELS[cat], value: cmds.map(c => `\`/${c}\``).join(' '), inline: false });
      }
    }

    const extra = ['setup', 'help'].filter(c => interaction.client.commands.has(c));
    if (extra.length) {
      embed.addFields({ name: '⚙️ System', value: extra.map(c => `\`/${c}\``).join(' '), inline: false });
    }

    embed.setFooter({ text: 'Battlegroundians Moderation' });
    await interaction.editReply({ embeds: [embed] });
  },
};
