import MemberModel from '../../../../schemas/Member';
import type FormEntry from '../../../FormEntry/FormEntry';
import assignMemberBadge from '../../../Member/assignBadge';
import parseMember from '../../../Member/parseMember';
import type Prompt from '../../Strategies/Prompt';
const getEmojisFromString = require('get-emojis-from-string');

const changeBadge = async (values: string[], prompt: Prompt, entry: FormEntry) => {
	console.log(prompt._id, ' handled');

	const { ownerId } = entry;
	const memberInstances = await MemberModel.find({ userId: ownerId }).exec();
	for (const memberDocument of memberInstances) {
		let [member] = await parseMember(memberDocument.guildId, memberDocument.userId);
		if (member?.manageable) {
			const badges = getEmojisFromString(values[0] ?? '', { onlyDefaultEmojis: true });
			const badge = badges.length ? badges[0].name : undefined;
			assignMemberBadge(memberDocument, 'custom', badge);
		}
	}
};

export default changeBadge;
