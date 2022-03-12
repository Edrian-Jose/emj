import type { Guild, GuildTextBasedChannel, Snowflake, ThreadChannel, ThreadChannelResolvable } from 'discord.js';
import parseChannel from '../Channel/parseChannel';

const parseThread = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: Snowflake | Exclude<GuildTextBasedChannel, ThreadChannel>,
	threadResolvable: ThreadChannelResolvable
): Promise<[ThreadChannel | null, Exclude<GuildTextBasedChannel, ThreadChannel> | null, Guild]> => {
	const [channel, guild] = await parseChannel(guildResolvable, channelResolvable);
	let thread: ThreadChannel | null = null;

	if (typeof threadResolvable === 'string') {
		if (channel) {
			thread = await (channel as Exclude<GuildTextBasedChannel, ThreadChannel>).threads.fetch(threadResolvable);
		} else {
			thread = null;
		}
	} else {
		thread = threadResolvable;
	}

	return [thread, channel as Exclude<GuildTextBasedChannel, ThreadChannel> | null, guild];
};

export default parseThread;
