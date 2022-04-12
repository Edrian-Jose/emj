import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('get-userid')
	.setDescription('Get Discord User ID of a member')
	.addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true));

export const execute = async (interaction: CommandInteraction) => {
	const user = interaction.options.getUser('user', true);
	await interaction.reply(user.id);
};
