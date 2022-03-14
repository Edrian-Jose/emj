import { registerUtilityChannel } from './../../actions/Guild/registerChannel';
import { channelMention, SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder().setName('admission').setDescription('Set the server admissions channel');

export const execute = async (interaction: CommandInteraction) => {
	const _guild = await registerUtilityChannel(interaction, 'admission');
	await interaction.reply({
		content: _guild ? `Admission channel set to ${channelMention(_guild.channels.admission)}` : `Admission channel failed to setup`,
		ephemeral: true
	});
};
