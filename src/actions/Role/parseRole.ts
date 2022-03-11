import type { Guild, Role, RoleResolvable, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseRole = async (guildResolvable: Snowflake | Guild, roleResolvable: RoleResolvable): Promise<[Role | null, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	let role: Role | null;

	if (typeof roleResolvable === 'string') {
		role = await guild.roles.fetch(roleResolvable);
	} else {
		role = roleResolvable;
	}
	return [role, guild];
};

export default parseRole;
