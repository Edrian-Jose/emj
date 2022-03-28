import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { ThreadChannel } from 'discord.js';
import syncThread from '../actions/Thread/syncThread';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldThread: ThreadChannel, newThread: ThreadChannel) {
		if (oldThread.parent) {
			await syncThread(oldThread.guild, oldThread.parent, newThread);
		}
	}
}
