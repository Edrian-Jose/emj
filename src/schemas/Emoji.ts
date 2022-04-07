import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

export type EmojiType = 'Discord Emoji' | 'Default Emoji';
interface Emoji {
	guildId: Snowflake;
	emojiId: Snowflake;
	emojiType: EmojiType;
	name: string;
	identifier: string;
	url: string;
	roles?: Snowflake[];
	thread?: {
		parent: Snowflake;
		id: Snowflake;
		threshold: number;
	};
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
	emojiType: {
		type: String,
		enum: ['Discord Emoji', 'Default Emoji'],
		default: 'Discord Emoji'
	},
	name: String,
	identifier: String,
	url: String,
	roles: [String],
	thread: {
		parent: String,
		id: String,
		threshold: {
			type: Number,
			default: 1
		}
	}
});

const EmojiModel = model<EmojiDocument>('Emoji', EmojiSchema);

export default EmojiModel;
