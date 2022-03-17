import type { UtilityChannelTypes } from '../../Guild/registerChannel';
import type { Guild, GuildMember, Message, WebhookMessageOptions } from 'discord.js';
import GuildModel from '../../../schemas/Guild';
import getPersonalThread from '../../Thread/getPersonalThread';
import parseChannel from '../parseChannel';
import getChannelWebhook from './getChannelWebhook';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';

const utilityWebhookSend = async (
	guild: Guild,
	member: GuildMember,
	utilityChannel: UtilityChannelTypes,
	options: WebhookMessageOptions,
	name?: string
): Promise<Message<boolean> | APIMessage | undefined> => {
	const _guild = await GuildModel.findOne({ guildId: guild.id });
	const threadName = name ?? `${member.user.username} ${utilityChannel}`;
	if (_guild) {
		const [channel] = await parseChannel(guild, _guild.channels[utilityChannel]);

		if (channel?.isText()) {
			let [thread] = await getPersonalThread(member, guild, channel, threadName);
			if (thread) {
				thread = await thread.setName(threadName);
				options.threadId = thread.id;
			}
			const webhook = await getChannelWebhook(channel, true);

			return await webhook?.send(options);
		}
	}
	return undefined;
};

export default utilityWebhookSend;
