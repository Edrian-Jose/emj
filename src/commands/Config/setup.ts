import { channelMention } from '@discordjs/builders';
import { registerUtilityChannel } from './../../actions/Guild/registerChannel';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';
import type { Args } from '@sapphire/framework';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import parseChannel from '../../actions/Channel/parseChannel';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Setup emjay bot',
	preconditions: ['AdminOnly'],
	subCommands: ['desk', 'applications', 'forms', 'welcome', 'teams', 'rooms', 'generator']
})
export class UserCommand extends SubCommandPluginCommand {
	public async desk(message: Message) {
		const _guild = await registerUtilityChannel(message, 'desk');

		if (_guild && _guild.channels.desk) {
			return temporaryReply(message, `Desk channel set to ${channelMention(_guild.channels.desk)}`, true);
		}
		return temporaryReply(message, `Desk channel failed to setup`, true);
	}

	public async applications(message: Message) {
		const _guild = await registerUtilityChannel(message, 'applications');

		if (_guild && _guild.channels.applications) {
			return temporaryReply(message, `Applications channel set to ${channelMention(_guild.channels.applications)}`, true);
		}
		return temporaryReply(message, `Applications channel failed to setup`, true);
	}

	public async forms(message: Message) {
		const _guild = await registerUtilityChannel(message, 'forms');

		if (_guild && _guild.channels.forms) {
			return temporaryReply(message, `Forms channel set to ${channelMention(_guild.channels.forms)}`, true);
		}
		return temporaryReply(message, `Forms channel failed to setup`, true);
	}

	public async welcome(message: Message) {
		const _guild = await registerUtilityChannel(message, 'welcome');

		if (_guild && _guild.channels.welcome) {
			return temporaryReply(message, `Welcome channel set to ${channelMention(_guild.channels.welcome)}`, true);
		}
		return temporaryReply(message, `Welcome channel failed to setup`, true);
	}
	public async teams(message: Message) {
		const _guild = await registerUtilityChannel(message, 'teams');

		if (_guild && _guild.channels.teams) {
			return temporaryReply(message, `Teams channel set to ${channelMention(_guild.channels.teams)}`, true);
		}
		return temporaryReply(message, `Teams channel failed to setup`, true);
	}

	public async rooms(message: Message) {
		const _guild = await registerUtilityChannel(message, 'rooms');

		if (_guild && _guild.channels.rooms) {
			return temporaryReply(message, `Rooms channel set to ${channelMention(_guild.channels.rooms)}`, true);
		}
		return temporaryReply(message, `Rooms channel failed to setup`, true);
	}

	public async generator(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}
		let channelId: string;
		try {
			let [_guild] = await getGuildDocument(message.guild);
			channelId = await args.pick('string');

			const [channel] = await parseChannel(message.guild, channelId);
			if (_guild && channel) {
				_guild.channels.generator = channel.id;
				_guild = await _guild.save();

				if (_guild.channels.generator) {
					return temporaryReply(message, `Generator channel set to ${channelMention(_guild.channels.generator)}`, true);
				}
			}
		} catch (error) {
			console.log(error);
			return temporaryReply(message, `Generator channel failed to setup`, true);
		}
	}
}
