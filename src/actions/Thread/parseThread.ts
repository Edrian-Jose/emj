import { Guild, GuildTextBasedChannel, NewsChannel, Snowflake, TextChannel, ThreadChannel, ThreadChannelResolvable } from 'discord.js';
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
			if (channel instanceof TextChannel || channel instanceof NewsChannel) {
				const channels = await guild.channels.fetch();
				if (channels.has(threadResolvable)) {
					thread = channels[threadResolvable];
				}
			}
		} else {
			thread = null;
		}
	} else {
		thread = threadResolvable;
	}

	return [thread, channel as Exclude<GuildTextBasedChannel, ThreadChannel> | null, guild];
};

export default parseThread;
