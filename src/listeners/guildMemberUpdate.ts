import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import syncMember from '../actions/Member/syncMember';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldMember: GuildMember, newMember: GuildMember) {
		console.log(`triggered`);
		
		await syncMember(oldMember.guild, newMember);
	}
}
