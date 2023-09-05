const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token, ownerID } = require('./config/config.json');
global.config = require('./config/config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
    client.user.setActivity('activity', { type: ActivityType.Watching });
	console.log(`Ready! Logged in as ${c.user.tag}`);
	console.log(`User ID: ${client.user.id}`)
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	// if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

const clean = async (client, text) => {
	// If our input is a promise, await it before continuing
	if (text && text.constructor.name == "Promise")
	  text = await text;
	
	// If the response isn't a string, `util.inspect()`
	// is used to 'stringify' the code in a safe way that
	// won't error out on objects with circular references
	// (like Collections, for example)
	if (typeof text !== "string")
	  text = require("util").inspect(text, { depth: 1 });
	
	// Replace symbols with character code alternatives
	text = text
	  .replace(/`/g, "`" + String.fromCharCode(8203))
	  .replace(/@/g, "@" + String.fromCharCode(8203))
	  .replaceAll(client.token, "[REDACTED]");
	
	// Send off the cleaned up result
	return text;
}

	client.on("messageCreate", async (message) => {

		// Get our input arguments
		const args = message.content.split(" ").slice(1);
	  
		// The actual eval command
		if (message.content.startsWith(`${config.prefix}eval`)) {
	  
		  // If the message author's ID does not equal
		  // our ownerID, get outta there!
		  if (message.author.id !== ownerID)
			return;
	  
		  // In case something fails, we to catch errors
		  // in a try/catch block
		  try {
			// Evaluate (execute) our input
			const evaled = eval(args.join(" "));
	  
			// Put our eval result through the function
			// we defined above
			const cleaned = await clean(client, evaled);
	  
			// Reply in the channel with our result
			message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
		  } catch (err) {
			// Reply in the channel with our error
			message.channel.send(`\`ERROR\` \`\`\`xl\n${cleaned}\n\`\`\``);
		  }
	  
		  // End of our command
		}
	  
		// End of our message event handler
	  });


client.login(token);