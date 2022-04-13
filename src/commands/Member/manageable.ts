import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import log from '../../actions/General/log';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import setMemberNickname from '../../actions/Member/setNickname';
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
						const newMember = await member.roles.remove(_guild.roles.unmanageable);
						setMemberNickname(newMember, _member.nickname ?? newMember.user.username, _newMember);
					} else {
						await member.roles.add(_guild.roles.unmanageable);
					}
				}
				await log(
					guild,
					`${message.author.username} use !manageable`,
					`${member.user.username} ${_newMember.manageable ? ' will now be ' : ' will now be not '}be manageable.`,
					message.author.id
				);
				return temporaryReply(message, `You will ${_newMember.manageable ? '' : 'not '}be manageable.`, true);
			}
		} else {
			return temporaryReply(message, `Something is wrong`, true);
		}
	}
}
