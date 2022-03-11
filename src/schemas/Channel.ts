import type { Snowflake } from 'discord.js';
import type { ChannelTypes } from 'discord.js/typings/enums';
import { Schema, model, Document } from 'mongoose';
import GuildModel from './Guild';

interface Channel {
	guildId: Snowflake;
	channelId: Snowflake;
	type: ChannelTypes;
	name?: string;
	emoji?: string;
	webhookId?: Snowflake;
}

interface ChannelBaseDocument extends Channel, Document {
	//add instance methods here
	fullName(): Promise<string>;
}

export interface ChannelDocument extends ChannelBaseDocument {
	//store ref typings here
}

const ChannelSchema = new Schema<ChannelDocument>({
	guildId: String,
	channelId: String,
	type: {
		type: Number,
		// TODO: Change this implementation to dynamically getting the length of enum ChannelTypes
		enum: [...Array(14).keys()],
		default: 0,
		required: true
	},
	name: String,
	emoji: String,
	webhookId: String
});

ChannelSchema.methods.fullName = async function (this: ChannelDocument) {
	const _seperator = (await GuildModel.findOne({ guildId: this.guildId }).exec())?.seperators.channel;
	const seperator = this.emoji && this.name ? _seperator : '';
	return (this.emoji ?? '') + seperator + (this.name ?? '');
};

const ChannelModel = model<ChannelDocument>('Channel', ChannelSchema);

export default ChannelModel;
