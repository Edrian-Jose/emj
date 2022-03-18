import type { Guild, Role, RoleResolvable, Snowflake } from 'discord.js';
import MemberModel from '../../schemas/Member';
import RoleModel, { RoleDocument } from '../../schemas/Role';
import parseGuild from '../Guild/parseGuild';
import parseRole from './parseRole';

export const getRoleDocument = async (
	guildResolvable: Snowflake | Guild,
	roleResolvable: RoleResolvable
): Promise<[(RoleDocument & { _id: any }) | null, Role | null, Guild]> => {
	let _role: (RoleDocument & { _id: any }) | null = null;
	const [role, guild] = await parseRole(guildResolvable, roleResolvable);
	const id = typeof roleResolvable === 'string' ? roleResolvable : roleResolvable.id;
	_role = await RoleModel.findOne({ guildId: guild.id, roleId: id }).exec();
	if (role) {
		if (!_role) {
			if (!role.members.first()?.user.bot) {
				_role = await RoleModel.create({
					guildId: guild.id,
					roleId: role.id
				});
				_role = await _role.save();
			}
		}
	} else if (_role) {
		const members = await MemberModel.find({ roles: { $all: [_role?._id] }, guildId: guild.id });
		members.forEach(async (member) => {
			const roles = member.roles?.filter((roleID) => roleID !== _role?._id);
			member.roles = roles;
			await member.save();
		});
		_role = await _role.delete();
	}
	return [_role, role, guild];
};

const syncRole = async (
	guildResolvable: Snowflake | Guild,
	roleResolvable: RoleResolvable
): Promise<[(RoleDocument & { _id: any }) | null, Role | null, Guild]> => {
	let [_role, role, guild] = await getRoleDocument(guildResolvable, roleResolvable);
	if (role && _role) {
		_role.members = Array.from(role.members.keys());
		_role.name = role.name;
		_role = await _role.save();
	}
	return [_role, role, guild];
};

export const syncRoles = async (
	guildResolvable: Snowflake | Guild,
	roles?: IterableIterator<Role>
): Promise<[Array<RoleDocument & { _id: any }>, Role[]]> => {
	const _roles: Array<RoleDocument & { _id: any }> = [];
	const parsedRoles: Role[] = [];
	const guild = await parseGuild(guildResolvable);
	if (guild && roles) {
		for (const role of roles) {
			const [_role, parsedRole] = await syncRole(guild, role);
			if (_role) {
				_roles.push(_role);
			}
			if (parsedRole) {
				parsedRoles.push(parsedRole);
			}
		}
	} else {
		const id = typeof guildResolvable === 'string' ? guildResolvable : guildResolvable.id;
		await RoleModel.deleteMany({ guildId: id }).exec();
	}
	return [_roles, parsedRoles];
};



export const cleanRoles = async (guildResolvable: Snowflake | Guild) => {
	const id = typeof guildResolvable === 'string' ? guildResolvable : guildResolvable.id;
	const _roles = await RoleModel.find({ guildId: id }).exec();
	_roles.forEach(async (_role) => {
		const [role] = await parseRole(guildResolvable, _role.roleId);
		if (!role) {
			await _role.delete();
		}
	});
};


export default syncRole;
