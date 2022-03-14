import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface Guild {
	guildId: Snowflake;
	name: string;
	iconURL: string;
	seperators: {
		channel: string;
		nickname: string;
	};
	channels: {
		admission: Snowflake;
		inquiries: Snowflake;
		applications: Snowflake;
	};
}

interface GuildBaseDocument extends Guild, Document {
	//add instance methods here
}

export interface GuildDocument extends GuildBaseDocument {
	//store ref typings here
}

const GuildSchema = new Schema<GuildDocument>({
	guildId: String,
	name: String,
	iconURL: String,
	seperators: {
		channel: {
			type: String,
			default: '︱',
			required: true
		},
		nickname: {
			type: String,
			default: '・',
			required: true
		}
	},
	channels: {
		admission: String,
		inquiries: String,
		applications: String
	}
});

const GuildModel = model<GuildDocument>('Guild', GuildSchema);

export default GuildModel;
