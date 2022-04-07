import { roleMention, channelMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message, ThreadChannel, TextChannel } from 'discord.js';
import parseMember from '../../actions/Member/parseMember';
import temporaryReply from '../../actions/Message/temporaryReply';
import { getRoleDocument } from '../../actions/Role/syncRole';

@ApplyOptions<CommandOptions>({
	preconditions: ['AdminOnly', 'ThreadOnly'],
	description: 'Assign thread to a role'
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const channel = message.channel as ThreadChannel;
		const parent = channel.parent as TextChannel;
		const role = await args.pick('role');
		if (role && parent && channel) {
			let [_role] = await getRoleDocument(role.guild, role);
			if (_role) {
				_role.thread = {
					parent: parent.id,
					id: channel.id
				};

				_role = await _role.save();
				await channel.setArchived(false);
				for (const memberId of _role.members) {
					const [member] = await parseMember(role.guild, memberId);
					if (member) {
						parent.permissionOverwrites.create(role, { VIEW_CHANNEL: true });
						if (member?.manageable) {
							await channel.members.add(member);
						}
					}
				}

				return temporaryReply(message, `${channelMention(channel.id)} has been reserved for ${roleMention(_role.roleId)}`, true);
			}
		}

		return temporaryReply(message, `Role can't found`, true);
	}
}
