import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { caseManager } from '../../../utils/caseManager.js';
import { sendModLog } from '../../../utils/modLog.js';
import { successEmbed, errorEmbed } from '../../../utils/modEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('massrole')
    .setDescription('Add or remove a role from multiple users')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption(o => o.setName('role').setDescription('The role').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Add or remove').setRequired(true).addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))
    .addUserOption(o => o.setName('user1').setDescription('User 1'))
    .addUserOption(o => o.setName('user2').setDescription('User 2'))
    .addUserOption(o => o.setName('user3').setDescription('User 3'))
    .addUserOption(o => o.setName('user4').setDescription('User 4'))
    .addUserOption(o => o.setName('user5').setDescription('User 5')),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const role = interaction.options.getRole('role', true);
    const action = interaction.options.getString('action', true);

    const users = [];
    for (let i = 1; i <= 5; i++) {
      const u = interaction.options.getUser(`user${i}`);
      if (u) users.push(u);
    }
    if (!users.length) return interaction.editReply({ embeds: [errorEmbed('Specify at least one user.')] });

    let count = 0;
    for (const user of users) {
      const member = interaction.guild.members.cache.get(user.id);
      if (!member) continue;
      try {
        if (action === 'add') await member.roles.add(role);
        else await member.roles.remove(role);
        count++;
      } catch {}
    }

    const record = caseManager.create(interaction.guild.id, { type: 'forcenick', userId: interaction.guild.id, moderatorId: interaction.user.id, reason: `Mass role ${action}: ${role.name} on ${count} users` });
    await sendModLog(interaction.guild, record);
    await interaction.editReply({ embeds: [successEmbed(`${action === 'add' ? 'Added' : 'Removed'} ${role.name} ${action === 'add' ? 'to' : 'from'} ${count} user(s)`)] });
  },
};
