import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Role } from 'discord.js';
import syncRole from '../actions/Role/syncRole';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(role: Role) {
		if (!role.members.first()?.user.bot) {
			await syncRole(role.guild, role);
		}
	}
}
