import { EmojiResolvable, Guild, GuildEmoji, ReactionEmoji, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseEmoji = async (guildResolvable: Snowflake | Guild, emojiResolvable: EmojiResolvable): Promise<[GuildEmoji | null, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	let emoji: GuildEmoji | null = null;

	if (typeof emojiResolvable === 'string') {
		try {
			emoji = await guild.emojis.fetch(emojiResolvable);
		} catch (error) {}
	} else if (emojiResolvable instanceof ReactionEmoji) {
		try {
			emoji = await guild.emojis.fetch((emojiResolvable as ReactionEmoji).id as string);
		} catch (error) {}
	} else {
		emoji = emojiResolvable;
	}
	return [emoji, guild];
};

export default parseEmoji;
