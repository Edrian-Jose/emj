import { roleMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';
import temporaryReply from '../../actions/Message/temporaryReply';
import { getRoleDocument } from '../../actions/Role/syncRole';

@ApplyOptions<CommandOptions>({
	description: 'AND Roles, assign a role when a and b roles are assigned. '
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const { guild } = message;
		const roles = Array.from(message.mentions.roles.keys());
		if (roles.length >= 3 && guild) {
			const assigningRole = roles.splice(0, 1)[0];
			const conditionRoles = roles;
			const [_role] = await getRoleDocument(guild, assigningRole);
			if (_role) {
				_role.and = conditionRoles;
				await _role.save();
				return temporaryReply(
					message,
					`${roleMention(assigningRole)} will be assigned when all of the roles [${conditionRoles
						.map((role) => roleMention(role))
						.join(', ')}] are present`,
					true
				);
			}
		}

		return temporaryReply(message, `Insufficient supplied roles. Do it in this order ROLE_TO_BE_ASSIGNED ...ROLES_REQUIRED`, true);
	}
}
