import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message, NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';
import sendColorSelector from '../../actions/Select/sendColorSelector';

@ApplyOptions<CommandOptions>({
	name: 'color',
	aliases: ['c'],
	description: 'Change your color role'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) {
			return temporaryReply(message, `You must be in a server channel to use this command`, true);
		}

		const sucess = sendColorSelector(message.channel as TextChannel | NewsChannel | ThreadChannel);
		if (!sucess) {
			return temporaryReply(message, `There is no color roles set in this server. Ask the admin to set it.`, true);
		} else {
			return temporaryReply(message, `Color picker requested successfully`, true);
		}
	}
}
