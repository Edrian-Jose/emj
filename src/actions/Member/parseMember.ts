import type { Guild, GuildMember, GuildMemberResolvable, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseMember = async (guildResolvable: Snowflake | Guild, memberResolvable: GuildMemberResolvable): Promise<[GuildMember, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	const member = await guild.members.fetch(memberResolvable);
	return [member, guild];
};

export default parseMember;
