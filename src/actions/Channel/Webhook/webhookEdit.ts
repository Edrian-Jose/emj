import type { Message, TextChannel, NewsChannel, WebhookEditMessageOptions } from 'discord.js';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import getChannelWebhook from './getChannelWebhook';

const webhookEdit = async (
	channel: TextChannel | NewsChannel,
	message: Message,
	options: WebhookEditMessageOptions
): Promise<Message | APIMessage | null> => {
	//
	const webhook = await getChannelWebhook(channel);
	if (webhook) {
		return await webhook.editMessage(message, options);
	}
	return null;
};

export default webhookEdit;
