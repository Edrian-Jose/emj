import type { BadgeTypes, MemberDocument } from '../../schemas/Member';

export const getBadge = (_member: MemberDocument) => {
	return _member.badge?.assigned ?? _member.badge?.custom ?? _member.badge?.role;
};

const assignMemberBadge = async (_member: MemberDocument, type: BadgeTypes, badge?: string) => {
	if (badge) {
		if (_member.badge) {
			_member.badge[type] = badge;
		} else {
			_member.badge = {
				[type]: badge
			};
		}
	} else if (_member.badge) {
		_member.badge[type] = undefined;
	}
	return await _member.save();
};

export default assignMemberBadge;
