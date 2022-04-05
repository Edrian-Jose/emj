import type { Guild, NonThreadGuildBasedChannel, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseChannel = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: NonThreadGuildBasedChannel | string
): Promise<[NonThreadGuildBasedChannel | null, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	let channel: NonThreadGuildBasedChannel | null = null;

	if (typeof channelResolvable === 'string') {
		try {
			channel = await guild.channels.fetch(channelResolvable);
		} catch (error) {
			console.log(error);
		}
	} else {
		channel = channelResolvable;
	}
	return [channel, guild];
};

export default parseChannel;
