import { EmojiResolvable, Guild, GuildEmoji, ReactionEmoji, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseEmoji = async (guildResolvable: Snowflake | Guild, emojiResolvable: EmojiResolvable): Promise<[GuildEmoji | null, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	let emoji: GuildEmoji | null = null;

	if (typeof emojiResolvable === 'string') {
		const emojis = await guild.emojis.fetch();
		if (emojis.has(emojiResolvable)) {
			emoji = emojis[emojiResolvable];
		}
	} else if (emojiResolvable instanceof ReactionEmoji) {
		const emojis = await guild.emojis.fetch();
		if (emojis.has((emojiResolvable as ReactionEmoji).id as string)) {
			emoji = emojis[(emojiResolvable as ReactionEmoji).id as string];
		}
	} else {
		emoji = emojiResolvable;
	}
	return [emoji, guild];
};

export default parseEmoji;
