import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { ThreadChannel } from 'discord.js';
import { getGuildDocument } from '../actions/Guild/syncGuild';
import syncThread from '../actions/Thread/syncThread';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(thread: ThreadChannel) {
		if (thread.guild && thread.parent) {
			const [_guild] = await getGuildDocument(thread.guild);
			if (_guild?.exempted.threadParent.includes(thread.parent.id)) {
				return;
			}
		}
		if (thread.parent) {
			await syncThread(thread.guild, thread.parent, thread);
		}
	}
}
