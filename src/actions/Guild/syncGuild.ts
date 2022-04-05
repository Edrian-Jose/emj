import { cleanRoles } from './../Role/syncRole';
import { cleanChannels } from './../Channel/syncChannel';
import { cleanEmojis, syncEmojis } from './../Emoji/syncEmoji';
import { syncChannelThreads } from './../Thread/syncThread';
import type { Guild, GuildEmoji, GuildMember, GuildTextBasedChannel, NonThreadGuildBasedChannel, Role, Snowflake, ThreadChannel } from 'discord.js';
import GuildModel, { GuildDocument } from '../../schemas/Guild';
import { syncChannels } from '../Channel/syncChannel';
import { syncMembers } from '../Member/syncMember';
import { syncRoles } from '../Role/syncRole';
import parseGuild from './parseGuild';
import type { ChannelDocument } from '../../schemas/Channel';
import type { RoleDocument } from '../../schemas/Role';
import type { MemberDocument } from '../../schemas/Member';
import type { ThreadDocument } from '../../schemas/Thread';
import type { EmojiDocument } from '../../schemas/Emoji';

export const getGuildDocument = async (guildResolvable: Snowflake | Guild): Promise<[(GuildDocument & { _id: any }) | null, Guild]> => {
	let _guild: (GuildDocument & { _id: any }) | null = null;
	const guild = await parseGuild(guildResolvable);
	const id = typeof guildResolvable === 'string' ? guildResolvable : guildResolvable.id;
	_guild = await GuildModel.findOne({ guildId: id }).exec();
	if (guild) {
		if (!_guild) {
			_guild = await GuildModel.create({
				guildId: guild.id
			});
			return [_guild, guild];
		}
	} else if (_guild) {
		_guild = await _guild.delete();
	}

	return [_guild, guild];
};

const syncGuild = async (guildResolvable: Snowflake | Guild): Promise<[(GuildDocument & { _id: any }) | null, Guild]> => {
	let [_guild, guild] = await getGuildDocument(guildResolvable);
	if (guild && _guild) {
		_guild.name = guild.name;
		_guild.iconURL = guild.iconURL() as string;
		_guild = await _guild.save();
		return [_guild, guild];
	}

	return [_guild, guild];
};

export type GuildDocuments = [
	Array<ChannelDocument & { _id: any }> | null,
	Array<RoleDocument & { _id: any }> | null,
	Array<MemberDocument & { _id: any }> | null,
	Array<ThreadDocument & { _id: any }> | null,
	Array<EmojiDocument & { _id: any }> | null
];

export type GuildEntities = [NonThreadGuildBasedChannel[] | null, Role[] | null, GuildMember[] | null, ThreadChannel[] | null, GuildEmoji[] | null];

export const syncGuildEntities = async (
	guildResolvable: Snowflake | Guild
): Promise<[(GuildDocument & { _id: any }) | null, GuildDocuments, Guild, GuildEntities]> => {
	const documents: GuildDocuments = [null, null, null, null, null];
	const entities: GuildEntities = [null, null, null, null, null];
	const [_guild, guild] = await syncGuild(guildResolvable);
	if (guild) {
		const [_channels, channels] = await syncChannels(guild, guild.channels.cache.values());
		const [_roles, roles] = await syncRoles(guild, guild.roles.cache.values());
		const [_emojis, emojis] = await syncEmojis(guild, guild.emojis.cache.values());
		documents[0] = _channels;
		documents[1] = _roles;
		documents[4] = _emojis;
		entities[0] = channels;
		entities[1] = roles;
		entities[4] = emojis;
		if (roles) {
			const fetchedMembers = (await guild.members.list({ limit: 1000 })).values();
			const [_members, members] = await syncMembers(guild, fetchedMembers);
			documents[2] = _members;
			entities[2] = members;
		}

		if (channels) {
			channels.forEach(async (channel) => {
				if (['GUILD_NEWS', 'GUILD_TEXT'].includes(channel.type)) {
					const [_threads, threads] = await syncChannelThreads(guild, channel as Exclude<GuildTextBasedChannel, ThreadChannel>);
					documents[3] = _threads;
					entities[3] = threads;
				}
			});
		}
	}
	return [_guild, documents, guild, entities];
};

export const cleanGuildEntities = async (guild: Snowflake | Guild) => {
	//
	await cleanChannels(guild);
	await cleanRoles(guild);
	await cleanEmojis(guild);
};
export default syncGuild;
