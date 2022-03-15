import { channelMention } from '@discordjs/builders';
import { registerUtilityChannel } from './../../actions/Guild/registerChannel';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Setup emjay bot',
	preconditions: ['AdminOnly'],
	subCommands: ['admissions', 'applications']
})
export class UserCommand extends SubCommandPluginCommand {
	public async admissions(message: Message) {
		const _guild = await registerUtilityChannel(message, 'admission');

		if (_guild && _guild.channels.admission) {
			return temporaryReply(message, `Admission channel set to ${channelMention(_guild.channels.admission)}`, true);
		}
		return temporaryReply(message, `Admission channel failed to setup`, true);
	}

	public async applications(message: Message) {
		const _guild = await registerUtilityChannel(message, 'applications');

		if (_guild && _guild.channels.admission) {
			return temporaryReply(message, `Applications channel set to ${channelMention(_guild.channels.applications)}`, true);
		}
		return temporaryReply(message, `Applications channel failed to setup`, true);
	}
}
