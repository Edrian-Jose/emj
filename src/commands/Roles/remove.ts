import { channelMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message, ThreadChannel } from 'discord.js';
import log from '../../actions/General/log';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<CommandOptions>({
	preconditions: ['ManagerOnly', 'ThreadOnly'],
	description: 'Deassign thread to a role'
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const channel = message.channel as ThreadChannel;
		const user = await args.pick('user');
		if (user && channel) {
			await channel.members.remove(user.id);
			await log(
				channel.guild,
				`${message.author.username} use !remove`,
				`${user.username} has been removed from ${channelMention(channel.id)}`,
				message.author.id
			);

			return temporaryReply(message, `${user.username} has been removed from ${channelMention(channel.id)}`, true);
		}

		return temporaryReply(message, `Role can't found`, true);
	}
}
