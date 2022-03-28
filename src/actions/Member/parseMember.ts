import type { Guild, GuildMember, GuildMemberResolvable, Snowflake } from 'discord.js';
import parseGuild from '../Guild/parseGuild';

const parseMember = async (guildResolvable: Snowflake | Guild, memberResolvable: GuildMemberResolvable): Promise<[GuildMember, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	const id = typeof memberResolvable === 'string' ? memberResolvable : memberResolvable.id;
	const member = await guild.members.fetch({ user: id, force: true });
	return [member, guild];
};

export default parseMember;
