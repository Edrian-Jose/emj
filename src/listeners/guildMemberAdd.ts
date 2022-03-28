import { getGuildDocument } from './../actions/Guild/syncGuild';
import { getMemberDocument } from './../actions/Member/syncMember';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import syncMember from '../actions/Member/syncMember';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		const [_member] = await getMemberDocument(member.guild, member);
		const [_newMember] = await syncMember(member.guild, member);
		if (_member && _member.roles && _member.roles.length) {
			member = await member.roles.add(_member.roles.map((role) => role.roleId));
		} else {
			const [_guild] = await getGuildDocument(member.guild);
			if (_guild && _guild.join && _guild.join.roles) {
				member = await member.roles.add(_guild.join.roles);
			}
		}
	}
}
