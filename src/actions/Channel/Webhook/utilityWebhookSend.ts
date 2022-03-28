import type { UtilityChannelTypes } from '../../Guild/registerChannel';
import type { Guild, GuildMember, Message, ThreadChannel, WebhookMessageOptions } from 'discord.js';
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
		const sentMessage = (await threadWebhookSend(guild, member, _guild.channels[utilityChannel], options, threadName, message)) as Message;
		const thread = sentMessage.channel as ThreadChannel;
		await thread.members.add(member);
		return sentMessage;
	}
	return undefined;
};


export default utilityWebhookSend;
