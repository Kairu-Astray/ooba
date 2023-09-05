const fs = require("fs");
const { SlashCommandBuilder, Discord } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Lists all commands'),
	async execute(interaction) {
		await interaction.reply('boop');
	},
};