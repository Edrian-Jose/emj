import { roleMention, channelMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import type { Message, ThreadChannel, TextChannel } from 'discord.js';
import log from '../../actions/General/log';
import temporaryReply from '../../actions/Message/temporaryReply';
import { getRoleDocument } from '../../actions/Role/syncRole';

@ApplyOptions<CommandOptions>({
	preconditions: ['AdminOnly', 'ThreadOnly'],
	description: 'Deassign thread to a role'
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const channel = message.channel as ThreadChannel;
		const parent = channel.parent as TextChannel;
		const role = await args.pick('role');
		if (role && parent && channel) {
			let [_role] = await getRoleDocument(role.guild, role);
			if (_role) {
				_role.thread = undefined;

				_role = await _role.save();
				parent.permissionOverwrites.delete(role);
				await log(
					channel.guild,
					`${message.author.username} use !unteam`,
					`${channelMention(channel.id)} has been removed as teams chat for ${roleMention(_role.roleId)}`,
					message.author.id
				);
				return temporaryReply(message, `${channelMention(channel.id)} has been removed as teams chat for ${roleMention(_role.roleId)}`, true);
			}
		}

		return temporaryReply(message, `Role can't found`, true);
	}
}
