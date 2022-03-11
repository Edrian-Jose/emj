import type { Guild, Role, RoleResolvable, Snowflake } from 'discord.js';
import RoleModel, { RoleDocument } from '../../schemas/Role';
import parseGuild from '../Guild/parseGuild';
import parseRole from './parseRole';

const syncRole = async (
	guildResolvable: Snowflake | Guild,
	roleResolvable: RoleResolvable
): Promise<[(RoleDocument & { _id: any }) | null, Role | null, Guild]> => {
	const [role, guild] = await parseRole(guildResolvable, roleResolvable);
	//TODO: do not create the role for bots
	if (role) {
		let _role = await RoleModel.findOne({ guildId: guild.id, roleId: role.id }).exec();
		if (!_role) {
			_role = await RoleModel.create({
				guildId: guild.id,
				roleId: role.id
			});
		}
		_role.name = role.name;
		_role.members = Array.from(role.members.keys());
		_role = await _role.save();
		return [_role, role, guild];
	}
	return [null, role, guild];
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
