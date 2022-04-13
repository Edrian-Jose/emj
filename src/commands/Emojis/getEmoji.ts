import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
// import getEmojisFromString from 'get-emojis-from-string';
const getEmojisFromString = require('get-emojis-from-string');
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<CommandOptions>({
	preconditions: ['ManagerOnly'],
	description: 'Get the emoji link of the emoji'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const badges = getEmojisFromString(message.content);
		const badge = badges.length ? badges[0] : undefined;
		if (badge) {
			message.reply(`${badge.image}`);
			return;
		} else {
			return temporaryReply(message, `No emoji found`, true);
		}
	}
}
