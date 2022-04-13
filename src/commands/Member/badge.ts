import { roleMention, userMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import log from '../../actions/General/log';
import assignMemberBadge from '../../actions/Member/assignBadge';
import assignRoleBadge from '../../actions/Member/assignRoleBadge';
import parseMember from '../../actions/Member/parseMember';
import refreshBadge from '../../actions/Member/refreshBadge';
import setMemberNickname from '../../actions/Member/setNickname';
const getEmojisFromString = require('get-emojis-from-string');
import { getMemberDocument } from '../../actions/Member/syncMember';
import temporaryReply from '../../actions/Message/temporaryReply';
import { getRoleDocument } from '../../actions/Role/syncRole';
import { IsCommandAllowed } from '../../lib/slashGuard';
import { AdminOnlyGuard } from '../../preconditions/AdminOnly';
import MemberModel, { MemberPopulatedDocument } from '../../schemas/Member';
import RoleModel from '../../schemas/Role';

@ApplyOptions<SubCommandPluginCommandOptions>({
	subCommands: ['set', 'assign', 'role', 'refresh']
})
export class UserCommand extends SubCommandPluginCommand {
	public async refresh(message: Message) {
		if (!message.guild) {
			return;
		}

		await refreshBadge(message.author.id);
		return temporaryReply(message, `${userMention(message.author.id)} badges has been refreshed`, true);
	}
	public async set(message: Message) {
		if (!message.guild) {
			return;
		}
		const badges = getEmojisFromString(message.content, { onlyDefaultEmojis: true });

		let [_member, member] = await getMemberDocument(message.guild, message.author);
		if (_member && member) {
			const badge = badges.length ? badges[0].name : undefined;
			const _role = await RoleModel.findOne({ badge }).exec();
			if (_role && badge) {
				return temporaryReply(message, `Badge ${badge} is reserved to Role ${roleMention(_role.roleId)}`, true);
			} else {
				const _newMember = await assignMemberBadge(_member, 'custom', badge);
				setMemberNickname(member, _newMember.nickname ?? member.user.username, _newMember);
				if (badge) {
					await log(
						message.guild,
						`${message.author.username} use !badge set`,
						`Badge ${badge} is set to User ${member.displayName}`,
						message.author.id
					);
					return temporaryReply(message, `Badge ${badge} is set to User ${userMention(_newMember.userId)}`, true);
				}
				await log(
					message.guild,
					`${message.author.username} use !badge set`,
					`Custom Badge cleared for User ${member.displayName}`,
					message.author.id
				);
				return temporaryReply(message, `Custom Badge cleared for User ${userMention(_newMember.userId)}`, true);
			}
		}
	}

	public async assign(message: Message, args: Args) {
		if (!message.guild || !(await IsCommandAllowed(message, AdminOnlyGuard))) {
			return;
		}
		const user = await args.pick('user');
		const badges = getEmojisFromString(message.content, { onlyDefaultEmojis: true });
		let [_member, member] = await getMemberDocument(message.guild, user);
		if (_member && member) {
			const badge = badges.length ? badges[0].name : undefined;
			const _newMember = await assignMemberBadge(_member, 'assigned', badge);
			setMemberNickname(member, _newMember.nickname ?? member.user.username, _newMember);
			if (badge) {
				await log(
					message.guild,
					`${message.author.username} use !badge assign`,
					`Badge ${badge} is set to User ${member.displayName}`,
					message.author.id
				);
				return temporaryReply(message, `Badge ${badge} is set to User ${userMention(_newMember.userId)}`, true);
			}
			return temporaryReply(message, `Assigned Badge cleared for User ${userMention(_newMember.userId)}`, true);
		}
	}

	public async role(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}

		const roleArg = await args.pick('role');
		const badges = getEmojisFromString(message.content, { onlyDefaultEmojis: true });
		const badge = badges.length ? badges[0].name : undefined;
		const _roleExisted = await RoleModel.findOne({ badge }).exec();
		if (_roleExisted && badge) {
			return temporaryReply(message, `Badge ${badge} is reserved to Role ${roleMention(_roleExisted.roleId)}`, true);
		}

		let [_role] = await getRoleDocument(message.guild, roleArg);
		if (_role) {
			_role.badge = badge;
			_role = await _role.save();

			for (const memberId of _role.members) {
				const _member = (await MemberModel.findOne({ userId: memberId }).populate('roles').exec()) as MemberPopulatedDocument;

				if (_member) {
					const [member] = await parseMember(_member.guildId, _member.userId);
					if (member) {
						const _newMember = await assignRoleBadge(_member, member);
						setMemberNickname(member, _newMember.nickname ?? member.user.username, _newMember);
					}
				}
			}

			if (badge) {
				await log(
					message.guild,
					`${message.author.username} use !badge role`,
					`Badge ${badge} is set to Role ${roleMention(_role.roleId)}`,
					message.author.id
				);
				return temporaryReply(message, `Badge ${badge} is set to Role ${roleMention(_role.roleId)}`, true);
			}
			await log(
				message.guild,
				`${message.author.username} use !badge role`,
				`Role Badge cleared for Role ${roleMention(_role.roleId)}`,
				message.author.id
			);
			return temporaryReply(message, `Role Badge cleared for Role ${roleMention(_role.roleId)}`, true);
		}
	}
}
