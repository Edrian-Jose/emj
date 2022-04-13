import { Guild, MessageEmbed, MessageOptions, WebhookMessageOptions } from 'discord.js';
import { DefaultAvatar, DefaultFooter } from '../../lib/constants';
import randomHook from '../../lib/randomHook';
import parseChannel from '../Channel/parseChannel';
import getChannelWebhook from '../Channel/Webhook/getChannelWebhook';
import { getGuildDocument } from '../Guild/syncGuild';

const log = async (guild: string | Guild, subject: string, desc: string, aux?: string) => {
	const [_guild, parsedGuild] = await getGuildDocument(guild);
	const options = {
		content: aux ?? '__',
		embeds: [
			new MessageEmbed()
				.setTitle(subject)
				.setDescription(desc)
				.setFooter({ text: DefaultFooter, iconURL: DefaultAvatar })
				.setTimestamp(Date.now())
		]
	} as MessageOptions;
	if (_guild && _guild.channels.logs) {
		const [channel] = await parseChannel(parsedGuild, _guild?.channels.logs);
		if (channel?.isText() || channel?.isThread()) {
			const webhook = await getChannelWebhook(channel, true);
			if (webhook) {
				const webhookOptions = options as WebhookMessageOptions;
				const hook = await randomHook();
				webhookOptions.username = hook.name;
				webhookOptions.avatarURL = hook.avatar;
				await webhook.send(webhookOptions);
			} else {
				await channel.send(options);
			}
		}
	}
};

export default log;
