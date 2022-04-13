import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedFieldData, Message, MessageEmbed } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';
import parseThread from '../../actions/Thread/parseThread';
import randomColor from '../../lib/randomColor';
import EmojiModel from '../../schemas/Emoji';

@ApplyOptions<CommandOptions>({
	description: 'View all collections'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild) {
			return;
		}
		await message.channel.sendTyping();
		const _emojis = await EmojiModel.find({ guildId: message.guild.id, 'thread.id': { $exists: true } }).exec();
		if (_emojis.length) {
			const fields: EmbedFieldData[] = [];

			for (const _emoji of _emojis) {
				const [thread] = await parseThread(_emoji.guildId, _emoji.thread!.parent, _emoji.thread!.id);
				if (thread) {
					const emoji = _emoji.emojiType === 'Discord Emoji' ? `<:${_emoji.identifier}>` : _emoji.name;
					fields.push({
						name: thread.name,
						value: `Emoji: ${emoji}     Threshold: ${_emoji.thread!.threshold}`
					});
				}
			}

			message.reply({
				embeds: [
					new MessageEmbed()
						.setColor(randomColor())
						.setTitle('Collections available on this Server')
						.setDescription(
							'To view a collection use the command \n `!view [emoji]`. Replace the [emoji] with an emoji listed below that you want to view. For example, to view the ℹ️︱Information collection type and send `!view ℹ️`'
						)
						.addFields(fields)
				]
			});

			return temporaryReply(message, `Found ${_emojis.length} collections`, true);
		} else {
			return temporaryReply(message, `No collections found`, true);
		}
	}
}
