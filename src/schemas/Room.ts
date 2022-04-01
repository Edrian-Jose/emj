import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface Room {
	channelId?: Snowflake;
	guildId: Snowflake;
	description?: string;
	createdTimestamp: number;
	index: number;
	name: string;
	emoji: string;
	password?: string;
	hint?: string;
	locked?: boolean;
	hidden?: boolean;
	createdByEvent: boolean;
	host: Snowflake;
	cohost?: Snowflake;
	controllerMessage: Snowflake;
}

export interface IRoom extends Room {}
interface RoomBaseDocument extends Room, Document {
	//add instance methods here
}

export interface RoomDocument extends RoomBaseDocument {
	//store ref typings here
}

const RoomSchema = new Schema<RoomDocument>({
	channelId: String,
	guildId: String,
	description: String,
	createdTimestamp: Number,
	index: Number,
	name: String,
	emoji: {
		type: String,
		default: '🚪'
	},
	password: String,
	hint: String,
	locked: Boolean,
	hidden: Boolean,
	createdByEvent: {
		type: Boolean,
		default: false
	},
	host: String,
	cohost: String,
	controllerMessage: String
});

const RoomModel = model<RoomDocument>('Room', RoomSchema);

export default RoomModel;
