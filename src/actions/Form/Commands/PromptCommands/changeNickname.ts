import MemberModel from '../../../../schemas/Member';
import type FormEntry from '../../../FormEntry/FormEntry';
import parseMember from '../../../Member/parseMember';
import setMemberNickname from '../../../Member/setNickname';
import type Prompt from '../../Strategies/Prompt';

const changeNickname = async (values: string[], prompt: Prompt, entry: FormEntry) => {
	console.log(prompt._id, ' handled');

	const { ownerId } = entry;
	const memberInstances = await MemberModel.find({ userId: ownerId }).exec();
	for (const memberDocument of memberInstances) {
		let [member] = await parseMember(memberDocument.guildId, memberDocument.userId);
		if (values.length && member?.manageable) {
			setMemberNickname(member, values[0], memberDocument);
		}
	}
};

export default changeNickname;
