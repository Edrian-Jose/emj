import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

export interface Location {
	guildId: Snowflake;
	channelId: Snowflake;
	threadId?: Snowflake;
	messageId: Snowflake;
}

interface RStudent {
	reference: string;
	removedAt?: number;
	locations?: {
		log: Location;
		information?: Location;
		student?: Location;
		trainee?: Location;
		finished?: Location;
		out?: Location;
	};
}

export interface IRStudent extends RStudent {
	//
}

interface RStudentBaseDocument extends RStudent, Document {
	//add instance methods here
}

export interface RStudentDocument extends RStudentBaseDocument {
	//store ref typings here
}

interface LocationDocument extends Location, Document {}
const LocationSchema = new Schema<LocationDocument>({
	guildId: String,
	channelId: String,
	threadId: String,
	messageId: String
});

const RStudentSchema = new Schema<RStudentDocument>({
	reference: String,
	removedAt: Number,
	locations: {
		log: LocationSchema,
		information: LocationSchema,
		student: LocationSchema,
		trainee: LocationSchema,
		finished: LocationSchema,
		out: LocationSchema
	}
});

const RStudentModel = model<RStudentDocument>('RStudent', RStudentSchema);

export default RStudentModel;
