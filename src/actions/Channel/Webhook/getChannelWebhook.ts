import { getChannelDocument } from '../syncChannel';
import { DefaultAvatar } from '../../../lib/constants';
import type { NewsChannel, Webhook } from 'discord.js';
import syncChannel from '../syncChannel';
import type { TextChannel } from 'discord.js';

export const registerWebhook = async (channel: TextChannel | NewsChannel, name?: string, avatarURL?: string) => {
	const webhook = await channel.createWebhook(name || 'Emj Webhook', {
		avatar: avatarURL || DefaultAvatar
	});

	const [_channel] = await syncChannel(channel.guild, channel);
	if (_channel?.webhookId) {
		return webhook;
	}
	return null;
};

const getChannelWebhook = async (channel: TextChannel | NewsChannel, force = false) => {
	let webhook: Webhook | null = null;
	const [_channel] = await getChannelDocument(channel.guild, channel);
	(await channel.fetchWebhooks()).size;
	if (_channel?.webhookId && (await channel.fetchWebhooks()).size) {
		try {
			webhook = await channel.client.fetchWebhook(_channel.webhookId);
		} catch (error) {
			console.log(error);
		}
	} else if (force) {
		webhook = await registerWebhook(channel);
	}
	return webhook;
};

export default getChannelWebhook;
