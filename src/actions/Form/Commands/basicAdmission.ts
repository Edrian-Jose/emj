import type { EntryAnswer } from './../handleFormCommand';
import moment from 'moment';
import EventModel, { IEvent } from '../../../schemas/Event';
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
	if (newAnswers[5].value && newAnswers[5].value[0]) {
		newAnswers[5].value[0] = `https://twitter.com/${newAnswers[5].value[0]}`;
	}
	if (newAnswers[6].value && newAnswers[6].value[0]) {
		newAnswers[6].value[0] = `https://www.tiktok.com/@${newAnswers[6].value[0]}`;
	}
	if (newAnswers[7].value && newAnswers[7].value[0]) {
		newAnswers[7].value[0] = `https://www.instagram.com/${newAnswers[7].value[0]}/`;
	}
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
			if (_guild.join.roles) {
				await member.roles.remove(_guild.join.roles);
			}
			const options = {
				customId: `birthday-${member.id}`,
				type: 'EXTERNAL',
				name: `🎉 HBD ___name-${member.user.id}! 🎉`,
				guildId: member.guild.id,
				description: `C4$huALL celebrates ___name-${member.user.id} Birthday Today. Send the celebrant a birthday message using the url provided in this event or greet him on our server`,
				scheduledStartTimestamp: birthday,
				scheduledEndTimestamp: birthdayObject.add(1, 'day').valueOf(),
				entityType: 'EXTERNAL',
				location: `https://discord.com/users/${entry.ownerId}/`,
				privacyLevel: 2,
				creatorId: member.id,
				repeat: 'year',
				eventId: undefined,
				createdTimestamp: undefined
			} as IEvent;

			const bevent = await EventModel.findOne({ customId: `birthday-${member.id}` }).exec();
			if (bevent) {
				await bevent.update({ $set: options }).exec();
			} else {
				await EventModel.create(options);
			}

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
