import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';
import type { FormDocument } from './Form';

interface Guild {
	guildId: Snowflake;
	name: string;
	iconURL: string;
	seperators: {
		channel: string;
		nickname: string;
	};
	join?: {
		roles?: Snowflake[];
		form?: string[];
	};
	exempted?: {
		channelCategory?: Snowflake[];
		threadParent?: Snowflake[];
	};
	generatorConfig: {
		index: number;
		defaultEmoji: string;
		defaultName: string;
	};
	channels: {
		desk: Snowflake;
		inquiries: Snowflake;
		applications: Snowflake;
		forms: Snowflake;
		welcome: Snowflake;
		teams: Snowflake;
		rooms: Snowflake;
		generator: Snowflake;
		threads: Snowflake;
		stage: Snowflake;
		feeds: Snowflake;
		apps: Snowflake;
	};
	roles: {
		probation: Snowflake;
	};
}

interface GuildBaseDocument extends Guild, Document {
	//add instance methods here
}

export interface GuildDocument extends GuildBaseDocument {
	//store ref typings here
	join: {
		roles: Snowflake[];
		form: FormDocument['_id'];
	};
}

export interface GuildPopulatedDocument extends GuildDocument {
	join: {
		roles: Snowflake[];
		form: FormDocument;
	};
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
	join: {
		roles: [String],
		form: {
			type: Schema.Types.ObjectId,
			ref: 'Form'
		}
	},
	exempted: {
		channelCategory: [String],
		threadParent: [String]
	},
	generatorConfig: {
		index: {
			type: Number,
			default: 0
		},
		defaultEmoji: {
			type: String,
			default: '🚪'
		},
		defaultName: {
			type: String,
			default: 'Room'
		}
	},
	channels: {
		desk: String,
		inquiries: String,
		applications: String,
		forms: String,
		welcome: String,
		teams: String,
		rooms: String,
		generator: String,
		threads: String,
		stage: String,
		feeds: String,
		apps: String
	},
	roles: {
		probation: String
	}
});

const GuildModel = model<GuildDocument>('Guild', GuildSchema);

export default GuildModel;
