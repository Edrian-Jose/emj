import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

export type RStatus = 'student' | 'trainee' | 'graduate';
export interface Location {
	guildId: Snowflake;
	channelId: Snowflake;
	threadId?: Snowflake;
	messageId: Snowflake;
}

interface RStudent {
	reference: string;
	registeredAt: number;
	removedAt?: number;
	status: RStatus;
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
	registeredAt: Number,
	removedAt: Number,
	status: String,
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
