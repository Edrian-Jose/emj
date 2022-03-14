import { DefaultAvatar } from './../../lib/constants';
import type { NewsChannel } from 'discord.js';
import syncChannel from './syncChannel';
import type { TextChannel } from 'discord.js';

const registerWebhook = async (channel: TextChannel | NewsChannel) => {
	await channel.createWebhook('Emj Webhook', {
		avatar: DefaultAvatar
	});

	await syncChannel(channel.guild, channel);
};

const getWebhook = async (channel: TextChannel | NewsChannel) => {
	// const _channel = await
};
export default registerWebhook;
