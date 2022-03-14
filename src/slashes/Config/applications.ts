import { AdminOnlyGuard } from './../../preconditions/AdminOnly';
import { registerUtilityChannel } from './../../actions/Guild/registerChannel';
import { channelMention, SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import IsAllowed from '../../lib/slashGuard';

export const data = new SlashCommandBuilder().setName('applications').setDescription('Set the server applications channel');

export const execute = async (interaction: CommandInteraction) => {
	const _guild = await registerUtilityChannel(interaction, 'applications');
	if (await IsAllowed(interaction, AdminOnlyGuard)) {
		await interaction.reply({
			content: _guild ? `Applications channel set to ${channelMention(_guild.channels.applications)}` : `Applications channel failed to setup`,
			ephemeral: true
		});
	}
};
