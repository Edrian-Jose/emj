import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import parseMember from '../../actions/Member/parseMember';
import { getMemberDocument } from '../../actions/Member/syncMember';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<SubCommandPluginCommandOptions>({
	preconditions: ['ModeratorOnly'],
	aliases: ['prob', '-'],
	description: 'Put a user under probation'
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		try {
			const member = await args.pick('member');
			let [_member] = await getMemberDocument(member.guild, member);
			const [_guild] = await getGuildDocument(member.guild);
			if (_member && _guild) {
				if (_member.probationRoles && _member.probationRoles.length) {
					const probationRoles = [..._member.probationRoles];
					_member.probationRoles = undefined;
					_member = await _member.save();

					if (_member) {
						await member.roles.add(probationRoles);
						await member.roles.remove(_guild.roles.probation);
					}
					return temporaryReply(message, `${member.displayName} is now free from probation`, true);
				} else {
					const [parsedMember] = await parseMember(member.guild, member);
					if (parsedMember) {
						const roles = Array.from(parsedMember.roles.cache.keys());
						_member.probationRoles = roles;
						_member = await _member.save();
					}
					await member.roles.set([_guild.roles.probation]);
					return temporaryReply(message, `${member.displayName} is now under probation`, true);
				}
			}
		} catch (error) {
			return temporaryReply(message, `Invalid command`, true);
		}
	}
}
