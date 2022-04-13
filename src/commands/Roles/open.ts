import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import temporaryReply from '../../actions/Message/temporaryReply';
import { getRoleDocument } from '../../actions/Role/syncRole';
import parseThread from '../../actions/Thread/parseThread';

@ApplyOptions<CommandOptions>({
	description: 'Open threads channel of a role'
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const role = await args.pick('role');

		if (role) {
			const [_guild, guild] = await getGuildDocument(role.guild);
			let [_role] = await getRoleDocument(role.guild, role);
			if (_guild && _role && _role.thread && _role.thread.id) {
				const [thread] = await parseThread(guild, _role.thread.parent, _role.thread.id);
				if (thread) {
					thread.setArchived(false);
					return temporaryReply(message, `${thread.name} is now open.`, true);
				} else {
					return temporaryReply(message, `Thread can't be found`, true);
				}
			} else {
				return temporaryReply(message, `Role doesn't have a teams thread`, true);
			}
		} else {
			return temporaryReply(message, `Role can't found`, true);
		}
	}
}
