import type { GuildScheduledEventEntityType, Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';
import type { RoomDocument } from './Room';

export type EventType = 'ROOM' | 'STAGE' | 'EXTERNAL';

interface Event {
	customId: string;
	eventId?: Snowflake;
	type: EventType;
	name: string;
	guildId: Snowflake;
	description?: string;
	scheduledStartTimestamp: number;
	scheduledEndTimestamp?: number;
	entityType: GuildScheduledEventEntityType;
	channelId?: Snowflake;
	location?: string;
	privacyLevel: number;
	creatorId: Snowflake;
	createdTimestamp?: number;
}

interface EventBaseDocument extends Event, Document {
	//add instance methods here
}

export interface EventDocument extends EventBaseDocument {
	//store ref typings here
	room: RoomDocument['_id'];
}

export interface EventPopulatedDocument extends EventBaseDocument {
	//store ref typings here
	room: RoomDocument;
}

const EventSchema = new Schema<EventDocument>({
	customId: String,
	eventId: String,
	type: String,
	name: String,
	guildId: String,
	description: String,
	scheduledStartTimestamp: Number,
	scheduledEndTimestamp: Number,
	entityType: {
		type: String,
		default: 'VOICE'
	},
	channelId: String,
	location: String,
	privacyLevel: {
		type: Number,
		default: 2
	},
	creatorId: String,
	createdTimestamp: Number
});

const EventModel = model<EventDocument>('Event', EventSchema);

export default EventModel;
