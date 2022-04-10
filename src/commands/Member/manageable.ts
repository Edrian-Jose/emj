import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import { getMemberDocument } from '../../actions/Member/syncMember';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<CommandOptions>({
	name: 'manageable',
	aliases: ['m'],
	description: 'Make you unmanageable'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const { guild } = message;
		if (guild) {
			const [_member, member] = await getMemberDocument(guild, message.author.id);
			if (_member && member) {
				const [_guild] = await getGuildDocument(_member.guildId);
				_member.manageable = !_member.manageable;
				const _newMember = await _member.save();
				if (_guild) {
					if (_newMember.manageable) {
						await member.roles.remove(_guild.roles.unmanageable);
					} else {
						await member.roles.add(_guild.roles.unmanageable);
					}
				}

				return temporaryReply(message, `You will ${_newMember.manageable ? '' : 'not '}be manageable.`, true);
			}
		} else {
			return temporaryReply(message, `Something is wrong`, true);
		}
	}
}
