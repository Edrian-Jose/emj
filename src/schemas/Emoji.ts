import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface Emoji {
	guildId: Snowflake;
	emojiId: Snowflake;
	name: string;
	identifier: string;
	url: string;
	roles: Snowflake[];
}

interface EmojiBaseDocument extends Emoji, Document {
	//add instance methods here
}

export interface EmojiDocument extends EmojiBaseDocument {
	//store ref typings here
}

const EmojiSchema = new Schema<EmojiDocument>({
	guildId: String,
	emojiId: String,
	name: String,
	identifier: String,
	url: String,
	roles: [String]
});

const EmojiModel = model<EmojiDocument>('Emoji', EmojiSchema);

export default EmojiModel;
