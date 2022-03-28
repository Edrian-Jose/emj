import { container } from '@sapphire/framework';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription('wala lang');

export const execute = async (interaction: CommandInteraction) => {
	const content = `Pong! Bot Latency ${Math.round(container.client.ws.ping)}ms`;
	await interaction.reply(content);
};
