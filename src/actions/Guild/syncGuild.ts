import type { Guild, GuildMember, NonThreadGuildBasedChannel, Role, Snowflake } from 'discord.js';
import GuildModel, { GuildDocument } from '../../schemas/Guild';
import { syncChannels } from '../Channel/syncChannel';
import { syncMembers } from '../Member/syncMember';
import { syncRoles } from '../Role/syncRole';
import parseGuild from './parseGuild';
import type { ChannelDocument } from '../../schemas/Channel';
import type { RoleDocument } from '../../schemas/Role';
import type { MemberDocument } from '../../schemas/Member';

const syncGuild = async (guildResolvable: Snowflake | Guild): Promise<[(GuildDocument & { _id: any }) | null, Guild]> => {
	const guild = await parseGuild(guildResolvable);
	if (guild) {
		let _guild = await GuildModel.findOne({ guildId: guild.id }).exec();
		if (!_guild) {
			_guild = await GuildModel.create({
				guildId: guild.id
			});
		}
		_guild.name = guild.name;
		_guild.iconURL = guild.iconURL() as string;
		_guild = await _guild.save();
		return [_guild, guild];
	}

	return [null, guild];
};

export type GuildDocuments = [
	Array<ChannelDocument & { _id: any }> | null,
	Array<RoleDocument & { _id: any }> | null,
	Array<MemberDocument & { _id: any }> | null
];

export type GuildEntities = [NonThreadGuildBasedChannel[] | null, Role[] | null, GuildMember[] | null];

export const syncGuildEntities = async (
	guildResolvable: Snowflake | Guild
): Promise<[(GuildDocument & { _id: any }) | null, GuildDocuments, Guild, GuildEntities]> => {
	const documents: GuildDocuments = [null, null, null];
	const entities: GuildEntities = [null, null, null];
	const [_guild, guild] = await syncGuild(guildResolvable);
	if (guild) {
		const [_channels, channels] = await syncChannels(guild, guild.channels.cache.values());
		const [_roles, roles] = await syncRoles(guild, guild.roles.cache.values());
		documents[0] = _channels;
		documents[1] = _roles;
		entities[0] = channels;
		entities[1] = roles;
		if (roles) {
			const fetchedMembers = (await guild.members.list({ limit: 1000 })).values();
			const [_members, members] = await syncMembers(guild, fetchedMembers);
			documents[2] = _members;
			entities[2] = members;
		}
	}
	return [_guild, documents, guild, entities];
};

export default syncGuild;
