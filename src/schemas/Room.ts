import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface Room {
	channelId?: Snowflake;
	createdTimestamp: number;
	index: number;
	name: string;
	emoji: string;
	password?: string;
	locked?: boolean;
	hidden?: boolean;
	createdByEvent: boolean;
	host: Snowflake;
	cohost?: Snowflake;
}

interface RoomBaseDocument extends Room, Document {
	//add instance methods here
}

export interface RoomDocument extends RoomBaseDocument {
	//store ref typings here
}

const RoomSchema = new Schema<RoomDocument>({
	channelId: String,
	createdTimestamp: Number,
	index: Number,
	name: String,
	emoji: {
		type: String,
		default: '🚪'
	},
	password: String,
	locked: Boolean,
	hidden: Boolean,
	createdByEvent: {
		type: Boolean,
		default: false
	},
	host: String,
	cohost: String
});

const RoomModel = model<RoomDocument>('Room', RoomSchema);

export default RoomModel;
