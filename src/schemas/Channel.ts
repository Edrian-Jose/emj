import type { ChannelTypeString } from '@sapphire/discord.js-utilities';
import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';
import GuildModel from './Guild';

interface Channel {
	guildId: Snowflake;
	channelId: Snowflake;
	type: ChannelTypeString;
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
		type: String,
		default: 'GUILD_TEXT',
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
