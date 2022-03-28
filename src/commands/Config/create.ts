import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<SubCommandPluginCommandOptions>({
	subCommands: ['form']
})
export class UserCommand extends SubCommandPluginCommand {
	public async form(message: Message) {
		return temporaryReply(message, 'Setup called', true);
	}
}

