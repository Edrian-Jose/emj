import { registerUtilityChannel } from '../../actions/Guild/registerChannel';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Setup admission channel'
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const _guild = await registerUtilityChannel(message, 'admission');

		if (_guild && _guild.channels.admission) {
			return temporaryReply(message, `Admission channel set to ${channelMention(_guild.channels.admission)}`, true);
		}
		return temporaryReply(message, `Admission channel failed to setup`, true);
	}
}
