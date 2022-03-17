import type { Guild, GuildMember, GuildMemberResolvable, Snowflake } from 'discord.js';
import MemberModel, { MemberDocument } from '../../schemas/Member';
import RoleModel from '../../schemas/Role';
import parseGuild from '../Guild/parseGuild';
import { getGuildDocument } from '../Guild/syncGuild';
import parseMember from './parseMember';

export const getMemberDocument = async (
	guildResolvable: Snowflake | Guild,
	memberResolvable: GuildMemberResolvable
): Promise<[(MemberDocument & { _id: any }) | null, GuildMember]> => {
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
): Promise<[(MemberDocument & { _id: any }) | null, GuildMember]> => {
	const [_member, member] = await getMemberDocument(guildResolvable, memberResolvable);

	if (_member && member && !member.user.bot) {
		if (member.nickname) {
			_member.nickname = member.nickname;
		}
		_member.tag = member.user.tag;
		const roles = Array.from(member.roles.cache.keys());
		const _roleIds = await RoleModel.find({ $or: [{ roleId: { $in: roles } }, { members: { $all: [member.id] } }] }, '_id').exec();
		_member.roles = _roleIds;
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
