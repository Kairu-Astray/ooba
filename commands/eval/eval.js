const fs = require("fs");
const {
    exec
} = require('node:child_process')
const {
    SlashCommandBuilder,
    Discord
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Select management commands.')
        .addStringOption(option =>
            option
            .setName('function')
            .setDescription('The process to be executed.')
            .setRequired(true))
        .setDefaultMemberPermissions()
        .setDMPermission(false),
    async execute(interaction) {
        if (interaction.user.id !== config.ownerID) return;
        const process = interaction.options.getString('function');
        if (process !== 'p_restart' && process !== 'p_kill' && process !== 'p_list') {
            await interaction.reply(`ERROR: ${process} is not valid`)
        } else if (process == 'p_restart') {
            interaction.reply('Restarting...')
            await exec('pm2 restart ooba')
        } else if (process == 'p_kill') {
            interaction.reply('Stopping...')
            await exec('pm2 kill ooba')
        } else if (process == 'p_list') {
            await exec('pm2 list', (err, output) => {
                if (err) {
                    interaction.reply('could not execute command: ', err)
                    return
                }
                interaction.reply({ content: `\`\`\`\n${output}\n\`\`\``, ephemeral: true })
            })
        }
    },
};