import { syncRoles } from '../actions/Role/syncRole';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { syncChannels } from '../actions/Channel/syncChannel';
import syncGuild from '../actions/Guild/syncGuild';
import { syncMembers } from '../actions/Member/syncMember';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(_guild: Guild) {
		const [, guild] = await syncGuild(_guild);
		await syncChannels(guild, guild.channels.cache.values());
		const [roles] = await syncRoles(guild, guild.roles.cache.values());
		if (roles) {
			const members = (await guild.members.list({ limit: 1000 })).values();
			console.log(members);
			await syncMembers(guild, members);
		}
	}
}
