import { roleMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';
import GuildModel from '../../schemas/Guild';

@ApplyOptions<SubCommandPluginCommandOptions>({
	subCommands: ['roles']
})
export class UserCommand extends SubCommandPluginCommand {
	public async roles(message: Message) {
		const roles = Array.from(message.mentions.roles.keys());
		const _guild = await GuildModel.findOne({ guildId: message.guild?.id });
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
}
