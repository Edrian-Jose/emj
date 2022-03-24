import type { UtilityChannelTypes } from '../../Guild/registerChannel';
import type { Guild, GuildMember, Message, WebhookMessageOptions } from 'discord.js';
import GuildModel from '../../../schemas/Guild';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import threadWebhookSend from './threadWebhookSend';

const utilityWebhookSend = async (
	guild: Guild,
	member: GuildMember,
	utilityChannel: UtilityChannelTypes,
	options: WebhookMessageOptions,
	name?: string,
	message?: Message
): Promise<Message<boolean> | APIMessage | undefined | null> => {
	const _guild = await GuildModel.findOne({ guildId: guild.id });
	const threadName = name ?? `${member.user.username} ${utilityChannel}`;

	if (_guild) {
		return threadWebhookSend(guild, member, _guild.channels[utilityChannel], options, threadName, message);
	}
	return undefined;
};


export default utilityWebhookSend;
