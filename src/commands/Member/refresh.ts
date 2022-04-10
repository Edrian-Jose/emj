import { roleMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import parseMember from '../../actions/Member/parseMember';
import refreshBadge from '../../actions/Member/refreshBadge';
import temporaryMessage from '../../actions/Message/temporaryMessage';
import temporaryReply from '../../actions/Message/temporaryReply';
import RoleModel from '../../schemas/Role';

@ApplyOptions<CommandOptions>({
	description: 'Refresh nickname and badge of the member'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const { guild } = message;
		if (guild) {
			refreshBadge(message.author.id).then(async () => {
				const [member] = await parseMember(guild, message.author);
				const forAddition: string[] = [];
				if (member) {
					const roles = Array.from(member.roles.cache.keys());
					for (const role of roles) {
						const _assigningRoles = await RoleModel.find({ and: { $all: [role] }, roleId: { $not: { $in: roles } } }).exec();
						for (const _role of _assigningRoles) {
							if (_role.and) {
								if (_role.and.length === 2 && roles.includes(_role.and[0]) && roles.includes(_role.and[1])) {
									forAddition.push(_role.roleId);
								}
							}
						}
					}

					if (forAddition.length) {
						await member.roles.add(forAddition);
						temporaryMessage(
							message.channel,
							`Role(s) ${forAddition.map((roleId) => roleMention(roleId)).join(', ')} has been given to you`
						);
					}
				}

				return temporaryReply(message, `Refreshed successfully`, true);
			});
		} else {
			return temporaryReply(message, `Something is wrong`, true);
		}
	}
}
