import type { Guild, GuildMember, GuildMemberResolvable, Snowflake } from 'discord.js';
import MemberModel, { MemberDocument } from '../../schemas/Member';
import RoleModel from '../../schemas/Role';
import parseGuild from '../Guild/parseGuild';
import { getGuildDocument } from '../Guild/syncGuild';
import syncRole from '../Role/syncRole';
import parseMember from './parseMember';

export const getMemberDocument = async (
	guildResolvable: Snowflake | Guild,
	memberResolvable: GuildMemberResolvable
): Promise<[(MemberDocument & { _id: any }) | null, GuildMember | null]> => {
	let _member: (MemberDocument & { _id: any }) | null = null;
	const [member, guild] = await parseMember(guildResolvable, memberResolvable);
	const id = typeof memberResolvable === 'string' ? memberResolvable : memberResolvable.id;
	_member = await MemberModel.findOne({ guildId: guild.id, userId: id }).exec();
	if (member && !member.user.bot) {
		if (!_member) {
			_member = await MemberModel.create({
				guildId: guild.id,
				userId: member.user.id
			});
			_member = await _member.save();
		}
	}
	return [_member, member];
};

const syncMember = async (
	guildResolvable: Snowflake | Guild,
	memberResolvable: GuildMemberResolvable
): Promise<[(MemberDocument & { _id: any }) | null, GuildMember | null]> => {
	const [_member, member] = await getMemberDocument(guildResolvable, memberResolvable);

	if (_member && member && !member.user.bot) {
		if (member.nickname) {
			_member.nickname = member.nickname;
		}
		_member.tag = member.user.tag;
		const cacheRoles = Array.from(member.roles.cache.keys());
		const roles: string[] = [];
		for (const roleId of cacheRoles) {
			const [_role, role, guild] = await syncRole(member.guild, roleId);
			if (role && role.members.has(member.id) && role.id !== guild.id) {
				roles.push(role.id);
			}
		}
		const _roles = await RoleModel.find({ $or: [{ roleId: { $in: roles } }, { members: { $all: [member.id] } }] }).exec();
		// console.log(_roles);
		_roles.forEach(async (_role) => {
			_role.members = _role.members.filter((memberId) => {
				if (memberId == member.id && !roles.includes(_role.roleId)) {
					return false;
				}
				return true;
			});
			if (!_role.members.includes(member.id) && roles.includes(_role.roleId)) {
				_role.members.push(member.id);
			}
			await _role.save();
		});

		_member.roles = _roles.filter((_role) => roles.includes(_role.roleId)).map((_role) => _role._id);
		await _member.save();
	}
	return [_member, member];
};

export const syncMembers = async (
	guildResolvable: Snowflake | Guild,
	members?: IterableIterator<GuildMember>
): Promise<[Array<MemberDocument & { _id: any }>, GuildMember[]]> => {
	const _members: Array<MemberDocument & { _id: any }> = [];
	const parsedMembers: GuildMember[] = [];
	const guild = await parseGuild(guildResolvable);
	if (guild && members) {
		for (const member of members) {
			const [_member, parsedMember] = await syncMember(guild, member);
			if (_member) {
				_members.push(_member);
			}
			if (parsedMember) {
				parsedMembers.push(parsedMember);
			}
		}
	}
	return [_members, parsedMembers];
};

export const cleanMembers = async (guildResolvable: Snowflake | Guild) => {
	const id = typeof guildResolvable === 'string' ? guildResolvable : guildResolvable.id;
	const _guild = await getGuildDocument(guildResolvable);

	if (!_guild) {
		await MemberModel.deleteMany({ guildId: id });
	}
};

export default syncMember;
