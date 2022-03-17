import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Snowflake } from 'discord-api-types/globals';
import type { Collection, ThreadMember } from 'discord.js';
import syncThread from '../actions/Thread/syncThread';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldMembers: Collection<Snowflake, ThreadMember>, newMembers: Collection<Snowflake, ThreadMember>) {
		const thread = (oldMembers.first() ?? newMembers.first())?.thread;
		if (thread && thread.parent) {
			await syncThread(thread.guild, thread.parent, thread, newMembers);
		}
	}
}
