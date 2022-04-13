import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import log from '../../actions/General/log';
import temporaryReply from '../../actions/Message/temporaryReply';
import auditANDRoles from '../../actions/Role/auditAndRoles';

@ApplyOptions<CommandOptions>({
	preconditions: ['AdminOnly'],
	description: 'Audit and roles'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		try {
			await message.channel.sendTyping();
			await auditANDRoles();
		} catch (error) {
			console.log(error);
			await log(message.guild!, `${message.author.username} use !audit`, `Failed to audit due to internal problem`, message.author.id);
			return temporaryReply(message, `Failed to audit due to internal problem`, true);
		} finally {
			await log(message.guild!, `${message.author.username} use !audit`, `AND roles audited successfully`, message.author.id);
			return temporaryReply(message, `AND roles audited successfully`, true);
		}
	}
}
