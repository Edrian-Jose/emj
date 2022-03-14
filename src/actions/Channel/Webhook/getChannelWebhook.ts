import { getChannelDocument } from '../syncChannel';
import { DefaultAvatar } from '../../../lib/constants';
import type { NewsChannel, Webhook } from 'discord.js';
import syncChannel from '../syncChannel';
import type { TextChannel } from 'discord.js';

export const registerWebhook = async (channel: TextChannel | NewsChannel) => {
	await channel.createWebhook('Emj Webhook', {
		avatar: DefaultAvatar
	});

	await syncChannel(channel.guild, channel);
};

const getChannelWebhook = async (channel: TextChannel | NewsChannel) => {
	let webhook: Webhook | null = null;
	const [_channel] = await getChannelDocument(channel.guild, channel);
	if (_channel?.webhookId) {
		webhook = await channel.client.fetchWebhook(_channel.webhookId);
	}
	return webhook;
};

export default getChannelWebhook;
