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
	options: WebhookMessageOptions
): Promise<Message<boolean> | APIMessage | undefined> => {
	const _guild = await GuildModel.findOne({ guildId: guild.id });
	if (_guild) {
		const [channel] = await parseChannel(guild, _guild.channels[utilityChannel]);

		if (channel?.isText()) {
			const [thread] = await getPersonalThread(member, guild, channel, `${member.user.username} forms`);
			const webhook = await getChannelWebhook(channel, true);
			options.threadId = thread?.id;
			return await webhook?.send(options);
		}
	}
	return undefined;
};

export default utilityWebhookSend;
