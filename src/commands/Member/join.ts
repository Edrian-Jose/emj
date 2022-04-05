import { roleMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import temporaryReply from '../../actions/Message/temporaryReply';
import FormModel, { FormDocument } from '../../schemas/Form';

@ApplyOptions<SubCommandPluginCommandOptions>({
	subCommands: ['roles', 'form']
})
export class UserCommand extends SubCommandPluginCommand {
	public async roles(message: Message) {
		if (!message.guild) {
			return;
		}
		const [_guild] = await getGuildDocument(message.guild);
		const roles = Array.from(message.mentions.roles.keys());

		if (_guild) {
			_guild.join.roles = roles;
			await _guild.save();
			return temporaryReply(
				message,
				`${roles.map((role) => roleMention(role)).join(', ')} will be assigned to new members when they first join to this server`,
				true
			);
		}
		return temporaryReply(message, `Guild server configuration file not found. It may be an internal server error.`, true);
	}

	public async form(message: Message, args: Args) {
		let _form: FormDocument | null = null;
		if (!message.guild) {
			return;
		}
		const id = await args.pick('string');
		try {
			_form = await FormModel.findById(id).populate('questions').exec();
		} catch (error) {
			return temporaryReply(message, `Invalid form id`, true);
		}
		const [_guild] = await getGuildDocument(message.guild);
		if (_guild && _form) {
			_guild.join.form = _form._id;
			await _guild.save();
			return temporaryReply(message, `${_form.title} successfully set to this server's admission form`, true);
		} else if (!_form) {
			return temporaryReply(message, `Form not found`, true);
		}

		return temporaryReply(message, `Guild server configuration file not found. It may be an internal server error.`, true);
	}
}
