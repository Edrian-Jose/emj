import type { ChannelDocument } from './Channel';
import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface Thread {
	threadId: Snowflake;
	archived: boolean;
	membersId: Snowflake[];
	parentId: Snowflake;
	ownerId: Snowflake;
}

interface ThreadBaseDocument extends Thread, Document {
	//add instance methods here
}

export interface ThreadDocument extends ThreadBaseDocument {
	//store ref typings here
	channel: ChannelDocument['_id'];
}

const ThreadSchema = new Schema<ThreadDocument>({
	threadId: String,
	archived: Boolean,
	membersId: [String],
	parentId: String,
	ownerId: String,
	channel: {
		type: Schema.Types.ObjectId,
		ref: 'Channel'
	}
});

const ThreadModel = model<ThreadDocument>('Thread', ThreadSchema);

export default ThreadModel;
