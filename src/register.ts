import { container } from '@sapphire/framework';
import type { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'node:fs';
import { config } from './lib/config-parser';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord.js/node_modules/discord-api-types';
import { Collection } from 'discord.js';

export interface SlashCommand {
	data: SlashCommandBuilder;
	execute: Function;
}

const getDirectories = (source: any) =>
	fs
		.readdirSync(source, { withFileTypes: true })
		.filter((dirent: { isDirectory: () => any }) => dirent.isDirectory())
		.map((dirent: { name: any }) => dirent.name);

const registerSlashes = async (post: string | undefined) => {
	const commands: RESTPostAPIApplicationCommandsJSONBody[] = new Array<RESTPostAPIApplicationCommandsJSONBody>();
	const commandDirectories = getDirectories(`${__dirname}/slashes`);
	const clientId = config.API.APP_ID;
	const guildId = config.BOT.GUILD as string;
	let count = 0;
	container.commands = new Collection();
	for (const dir of commandDirectories) {
		const commandFiles = fs.readdirSync(`${__dirname}/slashes/${dir}`).filter((file) => file.endsWith('.js'));
		for (const file of commandFiles) {
			count++;
			const command: SlashCommand = require(`${__dirname}/slashes/${dir}/${file}`);
			commands.push(command.data.toJSON());
			container.commands.set(command.data.name, command);
		}
	}
	container.logger.info(`Registered ${count} slash commands`);

	const rest = new REST({ version: '9' }).setToken(config.BOT.TOKEN);

	if (post) {
		try {
			container.logger.info('Started refreshing application (/) commands.');
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
			container.logger.info('Successfully reloaded application (/) commands.');
			container.logger.info(`Registered ${count} slash commands`);
		} catch (error) {
			console.error(error);
		}
	}
};

export default registerSlashes;

declare module '@sapphire/pieces' {
	interface Container {
		commands: Collection<string, SlashCommand>;
	}
}
