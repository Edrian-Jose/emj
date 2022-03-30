import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import assignMemberBadge from '../../actions/Member/assignBadge';
import assignRoleBadge from '../../actions/Member/assignRoleBadge';
import parseMember from '../../actions/Member/parseMember';
import refreshBadge from '../../actions/Member/refreshBadge';
import setMemberNickname from '../../actions/Member/setNickname';
const getEmojisFromString = require('get-emojis-from-string');
import { getMemberDocument } from '../../actions/Member/syncMember';
import { getRoleDocument } from '../../actions/Role/syncRole';
import MemberModel, { MemberPopulatedDocument } from '../../schemas/Member';

@ApplyOptions<SubCommandPluginCommandOptions>({
	subCommands: ['set', 'assign', 'role', 'refresh']
})
export class UserCommand extends SubCommandPluginCommand {
	public async refresh(message: Message) {
		if (!message.guild) {
			return;
		}

		await refreshBadge(message.author.id);
	}
	public async set(message: Message) {
		if (!message.guild) {
			return;
		}
		const badges = getEmojisFromString(message.content, { onlyDefaultEmojis: true });

		let [_member, member] = await getMemberDocument(message.guild, message.author);
		if (_member && member) {
			const _newMember = await assignMemberBadge(_member, 'custom', badges.length ? badges[0].name : undefined);
			setMemberNickname(member, _newMember.nickname ?? member.user.username, _newMember);
		}
	}

	public async assign(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}
		const user = await args.pick('user');
		const badges = getEmojisFromString(message.content, { onlyDefaultEmojis: true });
		let [_member, member] = await getMemberDocument(message.guild, user);
		if (_member && member) {
			const _newMember = await assignMemberBadge(_member, 'assigned', badges.length ? badges[0].name : undefined);
			setMemberNickname(member, _newMember.nickname ?? member.user.username, _newMember);
		}
	}

	public async role(message: Message, args: Args) {
		if (!message.guild) {
			return;
		}

		const roleArg = await args.pick('role');
		const badges = getEmojisFromString(message.content, { onlyDefaultEmojis: true });
		let [_role] = await getRoleDocument(message.guild, roleArg);
		if (_role) {
			_role.badge = badges.length ? badges[0].name : undefined;
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
		}
	}
}
