import type { Guild, NonThreadGuildBasedChannel, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseChannel = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: NonThreadGuildBasedChannel
): Promise<[NonThreadGuildBasedChannel | null, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	let channel: NonThreadGuildBasedChannel | null;

	if (typeof channelResolvable === 'string') {
		channel = await guild.channels.fetch(channelResolvable);
	} else {
		channel = channelResolvable;
	}
	return [channel, guild];
};

export default parseChannel;
