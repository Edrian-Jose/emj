import { registerUtilityChannel } from '../../actions/Guild/registerChannel';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Setup applications channel',
	preconditions: ['AdminOnly']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const _guild = await registerUtilityChannel(message, 'applications');

		if (_guild && _guild.channels.admission) {
			return temporaryReply(message, `Applications channel set to ${channelMention(_guild.channels.applications)}`, true);
		}
		return temporaryReply(message, `Applications channel failed to setup`, true);
	}
}
