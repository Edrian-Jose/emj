import { getGuildDocument } from './../../actions/Guild/syncGuild';
import { channelMention, roleMention } from '@discordjs/builders';
import { registerUtilityChannel } from './../../actions/Guild/registerChannel';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';
import type { Args } from '@sapphire/framework';
import parseChannel from '../../actions/Channel/parseChannel';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Setup emjay bot',
	preconditions: ['AdministatorOnly'],
	subCommands: [
		'desk',
		'applications',
		'forms',
		'welcome',
		'teams',
		'rooms',
		'generator',
		'threads',
		'stage',
		'feeds',
		'apps',
		'colors',
		'probation',
		'unmanageable',
		'manager',
		'moderator',
		'admin'
	]
})
export class UserCommand extends SubCommandPluginCommand {
	public async colors(message: Message, args: Args) {
		try {
			if (message.guild) {
				const roles = await args.repeat('role');
				let [_guild] = await getGuildDocument(message.guild);
				if (_guild) {
					_guild.colorRoles = roles.map((role) => role.id);
					_guild = await _guild.save();
					return temporaryReply(message, `Color roles set to [${_guild.colorRoles!.map((id) => roleMention(id)).join(', ')}]`, true);
				}
			}
		} catch (error) {
			return temporaryReply(message, `Bad command format`, true);
		}
	}

	public async manager(message: Message, args: Args) {
		try {
			const role = await args.pick('role');
			let [_guild] = await getGuildDocument(role.guild);
			if (_guild) {
				_guild.roles.manager = role.id;
				_guild = await _guild.save();
				return temporaryReply(message, `${roleMention(_guild.roles.manager)} will be the manager role for this server`, true);
			}
		} catch (error) {
			return temporaryReply(message, `Manager role failed to setup`, true);
		}
	}
	public async moderator(message: Message, args: Args) {
		try {
			const role = await args.pick('role');
			let [_guild] = await getGuildDocument(role.guild);
			if (_guild) {
				_guild.roles.moderator = role.id;
				_guild = await _guild.save();
				return temporaryReply(message, `${roleMention(_guild.roles.moderator)} will be the moderator role for this server`, true);
			}
		} catch (error) {
			return temporaryReply(message, `Moderator role failed to setup`, true);
		}
	}

	public async admin(message: Message, args: Args) {
		try {
			const role = await args.pick('role');
			let [_guild] = await getGuildDocument(role.guild);
			if (_guild) {
				_guild.roles.admin = role.id;
				_guild = await _guild.save();
				return temporaryReply(message, `${roleMention(_guild.roles.admin)} will be the admin role for this server`, true);
			}
		} catch (error) {
			return temporaryReply(message, `Admin role failed to setup`, true);
		}
	}

	public async unmanageable(message: Message, args: Args) {
		try {
			const role = await args.pick('role');
			let [_guild] = await getGuildDocument(role.guild);
			if (_guild) {
				_guild.roles.unmanageable = role.id;
				_guild = await _guild.save();
				return temporaryReply(
					message,
					`${roleMention(_guild.roles.unmanageable)} will now be set to members who dont want to be manageable`,
					true
				);
			}
		} catch (error) {
			return temporaryReply(message, `Manageable failed to setup`, true);
		}
	}
	public async probation(message: Message, args: Args) {
		try {
			const role = await args.pick('role');
			let [_guild] = await getGuildDocument(role.guild);
			if (_guild) {
				_guild.roles.probation = role.id;
				_guild = await _guild.save();
				return temporaryReply(message, `${roleMention(_guild.roles.probation)} will now be set to members under probation`, true);
			}
		} catch (error) {
			return temporaryReply(message, `Probation failed to setup`, true);
		}
	}

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

	public async threads(message: Message) {
		const _guild = await registerUtilityChannel(message, 'threads');

		if (_guild && _guild.channels.rooms) {
			return temporaryReply(message, `Threads channel set to ${channelMention(_guild.channels.threads)}`, true);
		}
		return temporaryReply(message, `Threads channel failed to setup`, true);
	}

	public async feeds(message: Message) {
		const _guild = await registerUtilityChannel(message, 'feeds');

		if (_guild && _guild.channels.feeds) {
			return temporaryReply(message, `Feeds channel set to ${channelMention(_guild.channels.feeds)}`, true);
		}
		return temporaryReply(message, `Feeds channel failed to setup`, true);
	}

	public async apps(message: Message) {
		const _guild = await registerUtilityChannel(message, 'apps');

		if (_guild && _guild.channels.feeds) {
			return temporaryReply(message, `Apps channel set to ${channelMention(_guild.channels.apps)}`, true);
		}
		return temporaryReply(message, `Apps channel failed to setup`, true);
	}

	public async stage(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}
		let channelId: string;
		try {
			let [_guild] = await getGuildDocument(message.guild);
			channelId = await args.pick('string');

			const [channel] = await parseChannel(message.guild, channelId);
			if (_guild && channel) {
				_guild.channels.stage = channel.id;
				_guild = await _guild.save();

				if (_guild.channels.stage) {
					return temporaryReply(message, `Stage channel set to ${channelMention(_guild.channels.stage)}`, true);
				}
			}
		} catch (error) {
			console.log(error);
			return temporaryReply(message, `Stage channel failed to setup`, true);
		}
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
