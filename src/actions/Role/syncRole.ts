import type { Guild, Role, RoleResolvable, Snowflake } from 'discord.js';
import RoleModel, { RoleDocument } from '../../schemas/Role';
import parseGuild from '../Guild/parseGuild';
import parseRole from './parseRole';

export const getRoleDocument = async (
	guildResolvable: Snowflake | Guild,
	roleResolvable: RoleResolvable
): Promise<[(RoleDocument & { _id: any }) | null, Role | null, Guild]> => {
	let _role: (RoleDocument & { _id: any }) | null = null;
	const [role, guild] = await parseRole(guildResolvable, roleResolvable);
	if (role) {
		const members = Array.from(role.members.values());
		_role = await RoleModel.findOne({ guildId: guild.id, roleId: role.id }).exec();
		if (!_role) {
			if (!(members[0] && members[0].user.bot)) {
				_role = await RoleModel.create({
					guildId: guild.id,
					roleId: role.id
				});
				_role = await _role.save();
			}
		}
	}
	return [_role, role, guild];
};

const syncRole = async (
	guildResolvable: Snowflake | Guild,
	roleResolvable: RoleResolvable
): Promise<[(RoleDocument & { _id: any }) | null, Role | null, Guild]> => {
	let [_role, role, guild] = await getRoleDocument(guildResolvable, roleResolvable);
	if (role && _role) {
		if (_role) {
			_role.members = Array.from(role.members.keys());
			_role.name = role.name;
			_role = await _role.save();
		}
	}
	return [_role, role, guild];
};

export const syncRoles = async (
	guildResolvable: Snowflake | Guild,
	roles: IterableIterator<Role>
): Promise<[Array<RoleDocument & { _id: any }>, Role[]]> => {
	const _roles: Array<RoleDocument & { _id: any }> = [];
	const parsedRoles: Role[] = [];
	const guild = await parseGuild(guildResolvable);
	for (const role of roles) {
		const [_role, parsedRole] = await syncRole(guild, role);
		if (_role) {
			_roles.push(_role);
		}
		if (parsedRole) {
			parsedRoles.push(parsedRole);
		}
	}
	return [_roles, parsedRoles];
};

export default syncRole;
