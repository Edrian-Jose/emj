import { italic, roleMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';
import type { Args } from '@sapphire/framework';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
const getEmojisFromString = require('get-emojis-from-string');

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Setup generator config',
	preconditions: ['AdminOnly'],
	subCommands: ['defaultName', 'emoji', 'roles']
})
export class UserCommand extends SubCommandPluginCommand {
	public async defaultName(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}
		let name: string;
		try {
			let [_guild] = await getGuildDocument(message.guild);
			name = await args.rest('string');
			if (_guild) {
				_guild.generatorConfig.defaultName = name;
				_guild = await _guild.save();
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
			let [_guild] = await getGuildDocument(message.guild);
			const emojis = getEmojisFromString(message.content, { onlyDefaultEmojis: true });

			if (_guild && emojis && emojis.length) {
				_guild.generatorConfig.defaultEmoji = emojis[0].name.toString();
				_guild = await _guild.save();
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
				let [_guild] = await getGuildDocument(message.guild);
				if (_guild) {
					_guild.generatorConfig.roles = roles.map((role) => role.id);
					_guild = await _guild.save();
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
