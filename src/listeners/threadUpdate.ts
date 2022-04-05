import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { ThreadChannel } from 'discord.js';
import { getGuildDocument } from '../actions/Guild/syncGuild';
import syncThread from '../actions/Thread/syncThread';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldThread: ThreadChannel, newThread: ThreadChannel) {
		if (newThread.guild && newThread.parent) {
			const [_guild] = await getGuildDocument(newThread.guild);
			if (_guild?.exempted?.threadParent?.includes(newThread.parent.id)) {
				return;
			}
		}
		if (oldThread.parent) {
			await syncThread(oldThread.guild, oldThread.parent, newThread);
		}
	}
}
