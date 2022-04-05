import type { Guild, GuildMember, Message, NewsChannel, TextChannel, WebhookMessageOptions } from 'discord.js';
import getPersonalThread from '../../Thread/getPersonalThread';
import parseChannel from '../parseChannel';
import getChannelWebhook from './getChannelWebhook';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import type { Snowflake } from 'discord-api-types/globals';
import webhookEdit from './webhookEdit';

const threadWebhookSend = async (
	guild: Guild,
	member: GuildMember,
	_channel: Snowflake | TextChannel | NewsChannel,
	options: WebhookMessageOptions,
	name?: string,
	message?: Message,
	notSelf?: boolean
): Promise<Message<boolean> | APIMessage | undefined | null> => {
	const threadName = name ?? `${member.user.username} thread`;

	const [channel] = await parseChannel(guild, _channel);

	if (channel?.isText()) {
		let [thread] = await getPersonalThread(member, guild, channel, threadName);
		if (thread) {
			thread.setArchived(false);
			if (!notSelf) {
				await thread.parent?.permissionOverwrites.create(member, { VIEW_CHANNEL: true });
			}
			thread = await thread.setName(threadName);
			options.threadId = thread.id;
		}
		const webhook = await getChannelWebhook(channel, true);

		if (message) {
			return await webhookEdit(channel, message, options);
		}
		return await webhook?.send(options);
	}

	return undefined;
};

export default threadWebhookSend;
