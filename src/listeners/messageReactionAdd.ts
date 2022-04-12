import { userMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { MessageEmbed, MessageEmbedOptions, MessageReaction, User } from 'discord.js';
import moment from 'moment';
import getChannelWebhook from '../actions/Channel/Webhook/getChannelWebhook';
import parseThread from '../actions/Thread/parseThread';
import randomColor from '../lib/randomColor';
import EmojiModel from '../schemas/Emoji';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(reaction: MessageReaction, user: User) {
		const { emoji, message, count, users } = reaction;
		const _emoji = await EmojiModel.findOne({ name: emoji.name }).exec();
		const reactors = Array.from(users.cache.keys());
		if (_emoji && _emoji.thread && _emoji.thread.threshold === count) {
			let [thread, parent] = await parseThread(_emoji.guildId, _emoji.thread.parent, _emoji.thread.id);
			if (thread && parent) {
				thread = await thread.setArchived(false);
				const webhook = await getChannelWebhook(parent, true);
				if (message.content || message.embeds.length) {
					let newContent = message.content ? message.content : 'Empty Message';
					const newEmbeds = message.embeds;
					if (!message.attachments.size && !message.embeds.length && !message.components.length && message.content) {
						const options = {
							timestamp: moment().valueOf(),
							color: randomColor(),
							url: message.url
						} as MessageEmbedOptions;

						if (message.content.length < 256) {
							options.title = message.content;
						} else {
							options.title = `Jump to the original message`;
							options.description = message.content;
						}

						newEmbeds.push(new MessageEmbed(options));
						newContent = reactors.length > 5 ? '@everyone' : reactors.map((id) => userMention(id)).join(' ');
					}
					await webhook?.send({
						threadId: thread.id,
						content: newContent,
						embeds: newEmbeds,
						components: message.components,
						username: message.author ? message.author?.username : user.username,
						avatarURL: message.author ? message.author.displayAvatarURL() : user.displayAvatarURL()
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
