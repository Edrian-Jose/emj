import { EmojiResolvable, Guild, GuildEmoji, ReactionEmoji, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseEmoji = async (guildResolvable: Snowflake | Guild, emojiResolvable: EmojiResolvable): Promise<[GuildEmoji | null, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	let emoji: GuildEmoji | null;

	if (typeof emojiResolvable === 'string') {
		emoji = await guild.emojis.fetch(emojiResolvable);
	} else if (emojiResolvable instanceof ReactionEmoji) {
		emoji = await guild.emojis.fetch((emojiResolvable as ReactionEmoji).id as string);
	} else {
		emoji = emojiResolvable;
	}
	return [emoji, guild];
};

export default parseEmoji;
