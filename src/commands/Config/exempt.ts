import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { CategoryChannel, Message, NewsChannel, TextChannel } from 'discord.js';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import type { Args } from '@sapphire/framework';
import temporaryReply from '../../actions/Message/temporaryReply';
import { channelMention } from '@discordjs/builders';
import type { GuildBasedChannelTypes } from '@sapphire/discord.js-utilities';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Exempt syncing to channels inside a category, or threads inside a channel',
	preconditions: ['AdminOnly'],
	subCommands: ['cat', 'tchannel']
})
export class UserCommand extends SubCommandPluginCommand {
	public async cat(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}
		let channel: GuildBasedChannelTypes;
		try {
			channel = await args.pick('guildChannel');
		} catch (error) {
			return await temporaryReply(message, `Please mention a channel`, true);
		}

		const [_guild] = await getGuildDocument(message.guild);
		if (_guild && channel.parent instanceof CategoryChannel) {
			if (_guild.exempted) {
				if (_guild.exempted.channelCategory) {
					if (_guild.exempted.channelCategory.includes(channel.parent.id)) {
						_guild.exempted.channelCategory = _guild.exempted.channelCategory.filter((id) => id !== channel.parent?.id);
						await _guild.save();
						return await temporaryReply(
							message,
							`${channelMention(channel.parent.id)} child channels will be synced to the database`,
							true
						);
					}
					_guild.exempted.channelCategory.push(channel.parent.id);
				} else {
					_guild.exempted.channelCategory = [channel.parent.id];
				}
			} else {
				_guild.exempted = {
					channelCategory: [channel.parent.id]
				};
			}

			await _guild.save();
			return await temporaryReply(message, `${channelMention(channel.parent.id)} child channels will not be synced to the database`, true);
		}
	}

	public async tchannel(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}

		let channel: GuildBasedChannelTypes;
		try {
			channel = await args.pick('guildChannel');
		} catch (error) {
			return await temporaryReply(message, `Please mention a channel`, true);
		}

		const [_guild] = await getGuildDocument(message.guild);

		if (_guild && (channel instanceof TextChannel || channel instanceof NewsChannel)) {
			if (_guild.exempted) {
				if (_guild.exempted.threadParent) {
					if (_guild.exempted.threadParent.includes(channel.id)) {
						_guild.exempted.threadParent = _guild.exempted.threadParent.filter((id) => id !== channel.id);
						await _guild.save();
						return await temporaryReply(message, `${channelMention(channel.id)} threads will be synced to the database`, true);
					}
					_guild.exempted.threadParent.push(channel.id);
				} else {
					_guild.exempted.threadParent = [channel.id];
				}
			} else {
				_guild.exempted = {
					threadParent: [channel.id]
				};
			}

			await _guild.save();
			return await temporaryReply(message, `${channelMention(channel.id)} threads will not be synced to the database`, true);
		}
	}
}
