import type { EmojiResolvable, Guild, GuildEmoji, Snowflake } from 'discord.js';
import type { EmojiDocument } from '../../schemas/Emoji';
import EmojiModel from '../../schemas/Emoji';
import parseGuild from '../Guild/parseGuild';
import parseEmoji from './parseEmoji';

export const getEmojiDocument = async (
	guildResolvable: Snowflake | Guild,
	emojiResolvable: EmojiResolvable
): Promise<[(EmojiDocument & { _id: any }) | null, GuildEmoji | null, Guild]> => {
	const [emoji, guild] = await parseEmoji(guildResolvable, emojiResolvable);

	if (emoji) {
		let _emoji = await EmojiModel.findOne({ guildId: guild.id, emojiId: emoji.id }).exec();
		if (!_emoji) {
			_emoji = await EmojiModel.create({
				guildId: guild.id,
				emojiId: emoji.id
			});
			_emoji = await _emoji.save();
		}
		return [_emoji, emoji, guild];
	}

	return [null, null, guild];
};

const syncEmoji = async (
	guildResolvable: Snowflake | Guild,
	emojiResolvable: EmojiResolvable
): Promise<[(EmojiDocument & { _id: any }) | null, GuildEmoji | null, Guild]> => {
	let [_emoji, emoji, guild] = await getEmojiDocument(guildResolvable, emojiResolvable);
	if (emoji && _emoji) {
		const roles = Array.from(emoji.roles.cache.keys());

		if (emoji.name) {
			_emoji.name = emoji.name;
		}
		_emoji.identifier = emoji.identifier;
		_emoji.url = emoji.url;
		_emoji.roles = roles;
		await _emoji.save();
	}
	return [_emoji, emoji, guild];
};

export const syncEmojis = async (
	guildResolvable: Snowflake | Guild,
	emojis: IterableIterator<GuildEmoji>
): Promise<[Array<EmojiDocument & { _id: any }>, GuildEmoji[]]> => {
	const _emojis: Array<EmojiDocument & { _id: any }> = [];
	const parsedEmojis: GuildEmoji[] = [];
	const guild = await parseGuild(guildResolvable);
	for (const emoji of emojis) {
		const [_emoji, parsedEmoji] = await syncEmoji(guild, emoji);
		if (_emoji) {
			_emojis.push(_emoji);
		}
		if (parsedEmoji) {
			parsedEmojis.push(parsedEmoji);
		}
	}
	return [_emojis, parsedEmojis];
};

export default syncEmoji;