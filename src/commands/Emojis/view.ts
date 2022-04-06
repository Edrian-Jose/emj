import { channelMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message, ThreadChannel, TextChannel } from 'discord.js';
const getEmojisFromString = require('get-emojis-from-string');
import temporaryReply from '../../actions/Message/temporaryReply';
import parseThread from '../../actions/Thread/parseThread';
import EmojiModel from '../../schemas/Emoji';

@ApplyOptions<CommandOptions>({
	description: 'Join a collection thread'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const channel = message.channel as ThreadChannel;
		const parent = channel.parent as TextChannel;
		const badges = getEmojisFromString(message.content);
		const badge = badges.length ? badges[0] : undefined;
		if (badge && parent && channel && message.member) {
			let _emoji = await EmojiModel.findOne({ guildId: parent.guildId, emojiType: badge.type, emojiId: badge.id }).exec();

			if (_emoji && _emoji.thread) {
				let [thread, parent] = await parseThread(_emoji.guildId, _emoji.thread.parent, _emoji.thread.id);
				if (thread && parent) {
					thread = await thread.setArchived(false);
					await thread.members.add(message.member);
					return temporaryReply(message, `${channelMention(thread.id)}`, true);
				}
			}
		}

		return temporaryReply(message, `No collection thread found`, true);
	}
}
