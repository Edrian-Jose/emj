import type { Snowflake } from 'discord.js';
import MemberModel, { MemberPopulatedDocument } from '../../schemas/Member';
import assignRoleBadge from './assignRoleBadge';
import parseMember from './parseMember';
import setMemberNickname from './setNickname';

const refreshBadge = async (memberId: Snowflake) => {
	let _member = (await MemberModel.findOne({ userId: memberId }).populate('roles').exec()) as MemberPopulatedDocument;
	if (_member) {
		const [member] = await parseMember(_member.guildId, _member.userId);
		if (member) {
			_member = await assignRoleBadge(_member, member);
			setMemberNickname(member, _member.nickname ?? member.user.username, _member);
		}
	}
};

export default refreshBadge;
