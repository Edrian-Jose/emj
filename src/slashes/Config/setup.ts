import { AdminOnlyGuard } from './../../preconditions/AdminOnly';
import { registerUtilityChannel } from './../../actions/Guild/registerChannel';
import { channelMention, SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import IsAllowed from '../../lib/slashGuard';

export const data = new SlashCommandBuilder()
	.setName('setup')
	.setDescription('Setup emj bot')
	.addSubcommand((subcommand) => subcommand.setName('applications').setDescription('Set the server applications channel'))
	.addSubcommand((subcommand) => subcommand.setName('admission').setDescription('Set the server admissions channel'));

export const execute = async (interaction: CommandInteraction) => {
	if (await IsAllowed(interaction, AdminOnlyGuard)) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case 'admission':
				var _guild = await registerUtilityChannel(interaction, 'admission');
				await interaction.reply({
					content: _guild ? `Admission channel set to ${channelMention(_guild.channels.admission)}` : `Admission channel failed to setup`,
					ephemeral: true
				});
				break;
			case 'applications':
				var _guild = await registerUtilityChannel(interaction, 'applications');
				await interaction.reply({
					content: _guild
						? `Applications channel set to ${channelMention(_guild.channels.applications)}`
						: `Applications channel failed to setup`,
					ephemeral: true
				});
				break;
			default:
				// TODO: Perform general setup here.
				await interaction.reply({
					content: `Setup completed`,
					ephemeral: true
				});
				break;
		}
	}
};
