import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import parseMember from '../../actions/Member/parseMember';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<CommandOptions>({
	name: 'clear-nick',
	description: 'Clear nickname'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const { guild } = message;
		if (guild) {
			const [member] = await parseMember(guild, message.author);
			if (member) {
				await member.setNickname(null);
				return temporaryReply(message, `Nickname succesfully cleared`, true);
			}
		} else {
			return temporaryReply(message, `Something is wrong`, true);
		}
	}
}
