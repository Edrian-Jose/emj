import type { Guild, Role, RoleResolvable, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseRole = async (guildResolvable: Snowflake | Guild, roleResolvable: RoleResolvable): Promise<[Role | null, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	let role: Role | null = null;
	if (guild.available) {
		if (typeof roleResolvable === 'string') {
			const roles = await guild.roles.fetch();
			if (roles.has(roleResolvable)) {
				role = roles[roleResolvable];
			}
		} else {
			role = roleResolvable;
		}
	}
	
	return [role, guild];
};

export default parseRole;
