import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildScheduledEvent } from 'discord.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) {
		console.log(oldEvent, newEvent);
	}
}
