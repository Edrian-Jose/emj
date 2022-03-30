import type { GuildMember } from 'discord.js';
import type { MemberPopulatedDocument } from '../../schemas/Member';
import assignMemberBadge from './assignBadge';
import parseMember from './parseMember';

const assignRoleBadge = async (_member: MemberPopulatedDocument, memberParameter?: GuildMember) => {
	const member = memberParameter ?? (await parseMember(_member.guildId, _member.userId))[0];
	const roleWithBadges = (_member as MemberPopulatedDocument).roles
		?.filter((role) => Boolean(role.badge) && Boolean(role.position))
		.sort((a, b) => b.position - a.position);
	if (member && roleWithBadges) {
		const roleBadge = roleWithBadges.length ? roleWithBadges[0].badge : undefined;
		return await assignMemberBadge(_member, 'role', roleBadge);
	}
	return _member;
};

export default assignRoleBadge;
