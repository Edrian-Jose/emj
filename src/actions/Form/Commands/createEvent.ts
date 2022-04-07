import moment from 'moment';
import type { IEvent } from '../../../schemas/Event';
import EventModel from '../../../schemas/Event';
import type FormEntry from '../../FormEntry/FormEntry';
import { getGuildDocument } from '../../Guild/syncGuild';
import parseMember from '../../Member/parseMember';
import type { EntryAnswer } from '../handleFormCommand';

const createEvent = async (
	entry: FormEntry,
	name: EntryAnswer,
	desc: EntryAnswer,
	start: EntryAnswer,
	end: EntryAnswer,
	repeat: EntryAnswer,
	location: EntryAnswer,
	customId: EntryAnswer
) => {
	//
	if (entry.location.guildId) {
		const [_guild] = await getGuildDocument(entry.location.guildId);
		let [member] = await parseMember(entry.location.guildId, entry.ownerId);

		if (member && _guild) {
			const options = {
				customId: `${customId.value![0]}-${member.id}`,
				type: 'EXTERNAL',
				name: `${name.value![0]}`,
				guildId: member.guild.id,
				description: `${desc.value && desc.value[0] ? desc.value[0] : 'No description'}`,
				scheduledStartTimestamp: moment(parseInt(start.value![0])).valueOf(),
				entityType: 'EXTERNAL',
				location: `${location.value![0]}`,
				privacyLevel: 2,
				creatorId: member.id
			} as IEvent;

			if (end.value && end.value[0]) {
				options.scheduledEndTimestamp = moment(parseInt(end.value[0])).valueOf();
			}

			if (repeat.value && repeat.value[0]) {
				options.repeat = `${repeat.value[0]}` as moment.unitOfTime.DurationConstructor;
			}

			const cevent = await EventModel.findOne({ customId: `${customId.value![0]}-${member.id}` }).exec();
			if (cevent) {
				await cevent.update({ $set: options }).exec();
			} else {
				await EventModel.create(options);
			}
		}
	}
};

export default createEvent;
