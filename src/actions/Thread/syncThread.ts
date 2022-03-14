import type { Guild, GuildTextBasedChannel, Snowflake, ThreadChannel, ThreadChannelResolvable } from 'discord.js';
import parseThread from './parseThread';
import ThreadModel, { ThreadDocument } from '../../schemas/Thread';
import parseChannel from '../Channel/parseChannel';

export const getThreadDocument = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: Snowflake | Exclude<GuildTextBasedChannel, ThreadChannel>,
	threadResolvable: ThreadChannelResolvable
): Promise<[(ThreadDocument & { _id: any }) | null, ThreadChannel | null, Exclude<GuildTextBasedChannel, ThreadChannel> | null, Guild | null]> => {
	let _thread: (ThreadDocument & { _id: any }) | null = null;
	const [thread, channel, guild] = await parseThread(guildResolvable, channelResolvable, threadResolvable);
	if (thread && channel) {
		_thread = await ThreadModel.findOne({ parentId: channel.id, threadId: thread.id }).exec();
		if (!_thread) {
			_thread = await ThreadModel.create({
				parentId: channel.id,
				threadId: thread.id
			});
		}

		_thread = await _thread.save();
	}
	return [_thread, thread, channel, guild];
};

const syncThread = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: Snowflake | Exclude<GuildTextBasedChannel, ThreadChannel>,
	threadResolvable: ThreadChannelResolvable
): Promise<[(ThreadDocument & { _id: any }) | null, ThreadChannel | null, Exclude<GuildTextBasedChannel, ThreadChannel> | null, Guild | null]> => {
	let [_thread, thread, channel, guild] = await getThreadDocument(guildResolvable, channelResolvable, threadResolvable);
	return [_thread, thread, channel, guild];
};

export const syncChannelThreads = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: Snowflake | Exclude<GuildTextBasedChannel, ThreadChannel>
): Promise<[Array<ThreadDocument & { _id: any }>, Array<ThreadChannel>]> => {
	const _threads: Array<ThreadDocument & { _id: any }> = [];
	const parsedThreads: Array<ThreadChannel> = [];

	const [channel, guild] = await parseChannel(guildResolvable, channelResolvable);
	const threads = (channel as Exclude<GuildTextBasedChannel, ThreadChannel>).threads.cache.values();
	for (const thread of threads) {
		const [_thread, parsedThread] = await syncThread(guild, channel as Exclude<GuildTextBasedChannel, ThreadChannel>, thread);
		if (_thread) {
			_threads.push(_thread);
		}
		if (parsedThread) {
			parsedThreads.push(parsedThread);
		}
	}
	return [_threads, parsedThreads];
};

export default syncThread;
