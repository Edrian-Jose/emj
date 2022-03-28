import type { Guild, GuildMember, GuildMemberResolvable, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseMember = async (guildResolvable: Snowflake | Guild, memberResolvable: GuildMemberResolvable): Promise<[GuildMember | null, Guild]> => {
	let member: GuildMember | null = null;
	const guild = await parseGuild(guildResolvable);
	const id = typeof memberResolvable === 'string' ? memberResolvable : memberResolvable.id;
	try {
		member = await guild.members.fetch({ user: id, force: true });
	} catch (error) {
		console.log(error);
	}
	return [member, guild];
};

export default parseMember;
