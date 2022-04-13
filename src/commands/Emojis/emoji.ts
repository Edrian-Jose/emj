import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import log from '../../actions/General/log';
import temporaryReply from '../../actions/Message/temporaryReply';
import EmojiModel from '../../schemas/Emoji';

@ApplyOptions<CommandOptions>({
	preconditions: ['ManagerOnly'],
	description: 'Create an emoji'
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		try {
			const name = await args.pick('string');

			const roles = args.finished ? [] : await args.repeat('role');
			const { guild, attachments } = message;
			if (guild && name) {
				let _emoji = await EmojiModel.findOne({ name: name }).exec();
				if (_emoji) {
					const emoji = await guild.emojis.fetch(_emoji.emojiId);
					emoji.edit({
						name: name,
						roles: roles
					});
					_emoji.name = name;
					if (roles.length) {
						_emoji.roles = roles.map((role) => role.id);
					}
					await _emoji.save();
					await log(
						guild,
						`${message.author.username} use !emoji`,
						`Emoji <:${_emoji.identifier}> updated ${roles.length ? 'for the roles' : ''} ${roles.join(', ')}`,
						message.author.id
					);
					return temporaryReply(
						message,
						`Emoji <:${_emoji.identifier}> updated ${roles.length ? 'for the roles' : ''} ${roles.join(', ')}`,
						true
					);
				} else {
					if (attachments.size) {
						const attachment = attachments.first();
						if (attachment) {
							const emoji = await guild.emojis.create(attachment.url, name, { roles: roles });
							_emoji = await EmojiModel.create({
								guildId: emoji.guild.id,
								emojiId: emoji.id,
								emojiType: 'Discord Emoji',
								name: emoji.name,
								identifier: emoji.identifier,
								url: emoji.url,
								roles: Array.from(emoji.roles.cache.keys())
							});
							await log(
								guild,
								`${message.author.username} use !emoji`,
								`Emoji <:${_emoji.identifier}> created ${roles.length ? 'for the roles' : ''} ${roles.join(', ')}`,
								message.author.id
							);
							return temporaryReply(
								message,
								`Emoji <:${_emoji.identifier}> created ${roles.length ? 'for the roles' : ''} ${roles.join(', ')}`,
								true
							);
						}
					} else {
						return temporaryReply(message, `Attach the image to be used`, true);
					}
				}
			}
			return temporaryReply(message, `No collection thread found`, true);
		} catch (error) {
			console.log(error);

			return temporaryReply(
				message,
				`Error occured. Please follow the format [name] [role_mentions] , and attach the image before you send`,
				true
			);
		}
	}
}
