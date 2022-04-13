import { userMention } from '@discordjs/builders';
import answersForm from '../../../components/embeds/answersForm';
import parseChannel from '../../Channel/parseChannel';
import type FormEntry from '../../FormEntry/FormEntry';
import { getGuildDocument } from '../../Guild/syncGuild';
import parseMember from '../../Member/parseMember';
import type { EntryAnswer } from '../handleFormCommand';

const defaultSubmit = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	if (entry.location.guildId) {
		const [_guild, guild] = await getGuildDocument(entry.location.guildId);
		let [member] = await parseMember(entry.location.guildId, entry.ownerId);

		if (_guild && _guild.channels.feeds && member) {
			const [feedsChannel] = await parseChannel(guild, _guild.channels.feeds);
			if (feedsChannel?.isText()) {
				feedsChannel.send({
					embeds: [
						answersForm(
							`${member.nickname ? member.nickname : member.user.username} response to ${entry.form.title}`,
							`This information may be irrelevant and can contain errors. Report to the managers if you find one. `,
							answers
						)
					],
					content: `@everyone ${userMention(member.id)}`
				});
			}
		}
	}
};

export default defaultSubmit;
