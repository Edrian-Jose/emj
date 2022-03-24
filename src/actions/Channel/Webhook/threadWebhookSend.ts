import type { Guild, GuildMember, Message, NewsChannel, TextChannel, WebhookMessageOptions } from 'discord.js';
import getPersonalThread from '../../Thread/getPersonalThread';
import parseChannel from '../parseChannel';
import getChannelWebhook from './getChannelWebhook';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import type { Snowflake } from 'discord-api-types/globals';

const threadWebhookSend = async (
	guild: Guild,
	member: GuildMember,
	_channel: Snowflake | TextChannel | NewsChannel,
	options: WebhookMessageOptions,
	name?: string
): Promise<Message<boolean> | APIMessage | undefined> => {
	const threadName = name ?? `${member.user.username} thread`;

	const [channel] = await parseChannel(guild, _channel);

	if (channel?.isText()) {
		let [thread] = await getPersonalThread(member, guild, channel, threadName);
		if (thread) {
			thread.setArchived(false);
			if (!(await thread.members.fetch(member))) {
				thread.members.add(member);
			}
			thread = await thread.setName(threadName);
			options.threadId = thread.id;
		}
		const webhook = await getChannelWebhook(channel, true);

		return await webhook?.send(options);
	}

	return undefined;
};

export default threadWebhookSend;
