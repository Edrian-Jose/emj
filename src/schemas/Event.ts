import type { GuildScheduledEventEntityType, PrivacyLevel, Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';
import type { RoomDocument } from './Room';

export type EventType = 'ROOM' | 'STAGE' | 'EXTERNAL';

interface Event {
	type: EventType;
	name: string;
	description: string;
	scheduledStartTimestamp: number;
	scheduledEndTimestamp: number;
	entityType: GuildScheduledEventEntityType;
	channelId: Snowflake;
	privacyLevel: PrivacyLevel;
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
	type: String,
	name: String,
	description: String,
	scheduledStartTimestamp: Number,
	scheduledEndTimestamp: Number,
	entityType: String,
	channelId: String,
	privacyLevel: String,
	creatorId: String,
	createdTimestamp: Number
});

const EventModel = model<EventDocument>('Event', EventSchema);

export default EventModel;
