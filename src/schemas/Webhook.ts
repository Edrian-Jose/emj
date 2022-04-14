import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface Webhook {
	username?: string;
	avatar?: string;
	isImpersonation: boolean;
	impersonation?: {
		memberId: Snowflake;
		guildId: Snowflake;
	};
	customId: string;
}

interface WebhookBaseDocument extends Webhook, Document {
	//add instance methods here
}

export interface WebhookDocument extends WebhookBaseDocument {
	//store ref typings here
}

const WebhookSchema = new Schema<WebhookDocument>({
	username: String,
	avatar: String,
	isImpersonation: {
		type: Boolean,
		default: false
	},
	impersonation: {
		memberId: String,
		guildId: String
	},
	customId: String
});

const WebhookModel = model<WebhookDocument>('Webhook', WebhookSchema);

export default WebhookModel;
