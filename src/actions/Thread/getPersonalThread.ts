import { getChannelDocument } from './../Channel/syncChannel';
import type { Guild, GuildMember, GuildTextBasedChannel, Snowflake, ThreadChannel } from 'discord.js';
import ThreadModel, { ThreadDocument } from '../../schemas/Thread';
import parseThread from './parseThread';
import syncThread from './syncThread';
import type { ChannelDocument } from '../../schemas/Channel';
import parseMember from '../Member/parseMember';


const getPersonalThread = async (
	member: Snowflake | GuildMember,
	guildResolvable: Snowflake | Guild,
	channelResolvable: Snowflake | Exclude<GuildTextBasedChannel, ThreadChannel>,
	threadName?: string
): Promise<[ThreadChannel | null, ThreadDocument | null, ChannelDocument | null]> => {
	const [_channel, channel] = await getChannelDocument(guildResolvable, channelResolvable);
	const [parsedMember] = await parseMember(guildResolvable, member);
	if (channel?.isText() && _channel) {
		let _thread = await ThreadModel.findOne({ ownerId: parsedMember.id, parentId: channel.id });
		if (!_thread) {
			const thread = await channel.threads.create({ name: threadName ?? `${parsedMember.user.username} thread`, autoArchiveDuration: 1440 });
			const ownerId = await thread.members.add(parsedMember);
			const [threadDoc, threadC] = await syncThread(guildResolvable, channelResolvable, thread);
			if (threadDoc) {
				threadDoc.ownerId = ownerId;
				await threadDoc.save();
				return [threadC, threadDoc, _channel];
			}
		} else if (_thread) {
			let [thread] = await parseThread(guildResolvable, channel, _thread.threadId);
			if (!thread) {
				const thread = await channel.threads.create({
					name: threadName ?? `${parsedMember.user.username} thread`,
					autoArchiveDuration: 1440
				});
				const ownerId = await thread.members.add(parsedMember);
				const [threadDoc, threadC] = await syncThread(guildResolvable, channelResolvable, thread);
				if (threadDoc) {
					threadDoc.ownerId = ownerId;
					await threadDoc.save();
					return [threadC, threadDoc, _channel];
				}
			}
			return [thread, _thread, _channel];
		}
	}
	return [null, null, _channel];
};

export default getPersonalThread;
