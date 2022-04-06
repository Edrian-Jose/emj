import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { MessageReaction, User } from 'discord.js';
import getChannelWebhook from '../actions/Channel/Webhook/getChannelWebhook';
import parseThread from '../actions/Thread/parseThread';
import EmojiModel from '../schemas/Emoji';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(reaction: MessageReaction, user: User) {
		const { emoji, message } = reaction;
		const _emoji = await EmojiModel.findOne({ name: emoji.name });

		if (_emoji && _emoji.thread) {
			let [thread, parent] = await parseThread(_emoji.guildId, _emoji.thread.parent, _emoji.thread.id);
			if (thread && parent) {
				thread = await thread.setArchived(false);
				const webhook = await getChannelWebhook(parent, true);
				if (message.content || message.embeds.length) {
					await webhook?.send({
						threadId: thread.id,
						content: message.content ? message.content : 'Forwarded Message',
						embeds: message.embeds,
						components: message.components,
						username: user.username,
						avatarURL: user.displayAvatarURL()
					});
				}

				if (message.attachments.size) {
					for (const [, attachment] of message.attachments) {
						await webhook?.send({
							threadId: thread.id,
							content: attachment.url,
							username: user.username,
							avatarURL: user.displayAvatarURL()
						});
					}
				}
			}
		}
	}
}
