import { syncGuildEntities } from './../actions/Guild/syncGuild';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(guild: Guild) {
		await syncGuildEntities(guild);
	}
}
