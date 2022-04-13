import { italic, roleMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';
import type { Args } from '@sapphire/framework';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import log from '../../actions/General/log';
const getEmojisFromString = require('get-emojis-from-string');

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Setup generator config',
	preconditions: ['AdminOnly'],
	subCommands: ['defaultName', 'emoji', 'roles', 'addname']
})
export class UserCommand extends SubCommandPluginCommand {
	public async addname(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}
		let name: string;
		let emoji: string;
		try {
			let [_guild, guild] = await getGuildDocument(message.guild);
			const emojiString = await args.pick('string');
			const emojis = getEmojisFromString(emojiString, { onlyDefaultEmojis: true });
			if (emojis && emojis.length) {
				emoji = emojis[0].name.toString();
			} else {
				return temporaryReply(message, `Bad command format. No emoji found`, true);
			}

			name = await args.rest('string');
			if (_guild) {
				const { names } = _guild.generatorConfig;
				if (names) {
					const included = names.filter((_name) => _name.name == name && _name.emoji == emoji);
					if (included && included.length) {
						_guild.generatorConfig.names = names.filter((_name) => _name.name != name || _name.emoji != emoji);
						_guild = await _guild.save();
						await log(
							guild,
							`${message.author.username} use !generator addname`,
							`${emoji}${_guild.seperators.channel}${name} has been _removed_ from generator random names`,
							message.author.id
						);
						return temporaryReply(
							message,
							`${emoji}${_guild.seperators.channel}${name} has been _removed_ from generator random names`,
							true
						);
					} else {
						_guild.generatorConfig.names?.push({
							name,
							emoji
						});
						_guild = await _guild.save();
						await log(
							guild,
							`${message.author.username} use !generator addname`,
							`${emoji}${_guild.seperators.channel}${name} has been _added_ from generator random names`,
							message.author.id
						);
						return temporaryReply(
							message,
							`${emoji}${_guild.seperators.channel}${name} has been _added_ from generator random names`,
							true
						);
					}
				} else {
					_guild.generatorConfig.names = [
						{
							name,
							emoji
						}
					];
					_guild = await _guild.save();
					await log(
						guild,
						`${message.author.username} use !generator addname`,
						`${emoji}${_guild.seperators.channel}${name} has been _added_ from generator random names`,
						message.author.id
					);
					return temporaryReply(message, `${emoji}${_guild.seperators.channel}${name} has been _added_ from generator random names`, true);
				}
			}
		} catch (error) {
			console.log(error);
			return temporaryReply(message, `Error occured. Bad command format.`, true);
		}
	}
	public async defaultName(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}
		let name: string;
		try {
			let [_guild, guild] = await getGuildDocument(message.guild);
			name = await args.rest('string');
			if (_guild) {
				_guild.generatorConfig.defaultName = name;
				_guild = await _guild.save();
				await log(
					guild,
					`${message.author.username} use !generator defaultName`,
					`Default name to generator set to ${italic(_guild.generatorConfig.defaultName)}`,
					message.author.id
				);
				return temporaryReply(message, `Default name to generator set to ${italic(_guild.generatorConfig.defaultName)}`, true);
			}
		} catch (error) {
			console.log(error);
			return temporaryReply(message, `Generator default name failed to setup`, true);
		}
	}

	public async emoji(message: Message) {
		if (!message.guild) {
			return;
		}

		try {
			let [_guild, guild] = await getGuildDocument(message.guild);
			const emojis = getEmojisFromString(message.content, { onlyDefaultEmojis: true });

			if (_guild && emojis && emojis.length) {
				_guild.generatorConfig.defaultEmoji = emojis[0].name.toString();
				_guild = await _guild.save();
				await log(
					guild,
					`${message.author.username} use !generator emoji`,
					`Default emoji to generator set to ${italic(_guild.generatorConfig.defaultEmoji)}`,
					message.author.id
				);
				return temporaryReply(message, `Default emoji to generator set to ${italic(_guild.generatorConfig.defaultEmoji)}`, true);
			}
		} catch (error) {
			console.log(error);
			return temporaryReply(message, `Generator default emoji failed to setup`, true);
		}
	}

	public async roles(message: Message, args: Args) {
		try {
			if (message.guild) {
				const roles = await args.repeat('role');
				let [_guild, guild] = await getGuildDocument(message.guild);
				if (_guild) {
					_guild.generatorConfig.roles = roles.map((role) => role.id);
					_guild = await _guild.save();
					await log(
						guild,
						`${message.author.username} use !generator roles`,
						`Generator roles hierarchy [${_guild.generatorConfig.roles.map((id) => roleMention(id)).join(', ')}]`,
						message.author.id
					);
					return temporaryReply(
						message,
						`Generator roles hierarchy [${_guild.generatorConfig.roles.map((id) => roleMention(id)).join(', ')}]`,
						true
					);
				}
			}
		} catch (error) {
			return temporaryReply(message, `Bad command format`, true);
		}
	}
}
