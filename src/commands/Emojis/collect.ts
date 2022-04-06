import { channelMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message, ThreadChannel, TextChannel } from 'discord.js';
const getEmojisFromString = require('get-emojis-from-string');
import temporaryReply from '../../actions/Message/temporaryReply';
import EmojiModel from '../../schemas/Emoji';

@ApplyOptions<CommandOptions>({
	preconditions: ['AdminOnly', 'ThreadOnly'],
	description: 'Assign thread to a emoji'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const channel = message.channel as ThreadChannel;
		const parent = channel.parent as TextChannel;
		const badges = getEmojisFromString(message.content);
		const badge = badges.length ? badges[0] : undefined;
		if (badge && parent && channel) {
			let _emoji = await EmojiModel.findOne({ guildId: parent.guildId, emojiType: badge.type, emojiId: badge.id }).exec();
			try {
				if (!_emoji) {
					_emoji = await EmojiModel.create({
						guildId: parent.guildId,
						emojiId: badge.id,
						emojiType: badge.type,
						name: badge.name,
						identifier: badge.name,
						url: badge.image
					});
				}
			} catch (error) {
			} finally {
				if (_emoji) {

					if (_emoji.thread) {
						_emoji.thread = undefined;
						await _emoji.save();
						const emoji = _emoji.emojiType === 'Discord Emoji' ? `<:${_emoji.identifier}>` : _emoji.name;
						return temporaryReply(
							message,
							`Messages with ${emoji} reaction will now not be collected to ${channelMention(channel.id)}`,
							true
						);
					}
					_emoji.thread = {
						parent: parent.id,
						id: channel.id
					};
					await _emoji.save();
					const emoji = _emoji.emojiType === 'Discord Emoji' ? `<:${_emoji.identifier}>` : _emoji.name;
					return temporaryReply(message, `Messages with ${emoji} reaction will be collected to ${channelMention(channel.id)}`, true);
				}
			}
		}

		return temporaryReply(message, `Emoji can't found`, true);
	}
}
