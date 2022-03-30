import type { GuildMember } from 'discord.js';
import type { MemberDocument } from '../../schemas/Member';
import { getGuildDocument } from '../Guild/syncGuild';
import { getMemberDocument } from './syncMember';

const setMemberNickname = async (member: GuildMember, nickname: string, memberDocument?: MemberDocument) => {
	const nick: string[] = [nickname];
	const _member = memberDocument ?? (await getMemberDocument(member.guild, member))[0];
	const [_guild] = await getGuildDocument(member.guild);
	if (_member) {
		if (_member.badge) {
			const badge = _member.badge.assigned ?? _member.badge.custom ?? _member.badge.role;
			if (badge) {
				nick.push(badge);
			}
		}
	}
	if (_guild) {
		await member.setNickname(nick.join(_guild.seperators.nickname));
	}
};

export default setMemberNickname;
