import type { EntryAnswer } from './../handleFormCommand';
import moment from 'moment';
import EventModel from '../../../schemas/Event';
import type FormEntry from '../../FormEntry/FormEntry';
import { getGuildDocument } from '../../Guild/syncGuild';
import parseMember from '../../Member/parseMember';
import parseChannel from '../../Channel/parseChannel';
import answersForm from '../../../components/embeds/answersForm';
import { userMention } from '@discordjs/builders';
import setMemberNickname from '../../Member/setNickname';

const transformValues = (answers: EntryAnswer[]): EntryAnswer[] => {
	const newAnswers = [...answers];
	newAnswers[2].value![0] = moment(parseInt(answers[2].value![0])).format('dddd, MMMM Do YYYY');
	newAnswers[12].value![0] = `https://bit.ly/12123sa`;
	return newAnswers;
};

const basicAdmission = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	//

	if (entry.location.guildId) {
		const [_guild, guild] = await getGuildDocument(entry.location.guildId);
		let [member] = await parseMember(entry.location.guildId, entry.ownerId);
		const nickname = answers[0].value![0];
		let birthdayObject = moment(parseInt(answers[2].value![0])).set('year', moment().year());
		let birthday = birthdayObject.valueOf();
		if (birthday < moment().valueOf()) {
			birthdayObject = birthdayObject.add(1, 'year');
			birthday = birthdayObject.valueOf();
		}
		if (member && _guild && _guild.channels.stage) {
			await setMemberNickname(member, nickname ?? member.user.username);
			await EventModel.create({
				customId: `birthday-${member.id}`,
				type: 'STAGE',
				name: `🎉 Happy Birthday ${member.user.username}! 🎉`,
				guildId: member.guild.id,
				description: `${member.user.username} Birthday Party`,
				scheduledStartTimestamp: birthday,
				scheduledEndTimestamp: birthdayObject.add(1, 'day').valueOf(),
				entityType: 'STAGE_INSTANCE',
				channelId: _guild.channels.stage,
				privacyLevel: 2,
				creatorId: member.id
			});

			if (_guild && _guild.channels.feeds) {
				const [feedsChannel] = await parseChannel(guild, _guild.channels.feeds);
				if (feedsChannel?.isText()) {
					feedsChannel.send({
						embeds: [
							answersForm(
								`${member.nickname ? member.nickname : member.user.username} Profile`,
								`This information may be irrelevant and can contain errors. Report to the managers if you find one. `,
								transformValues(answers)
							)
						],
						content: `@everyone ${userMention(member.id)}`
					});
				}
			}
		}
	}
};
export default basicAdmission;
