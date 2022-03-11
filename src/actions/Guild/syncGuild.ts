import type { Guild, Snowflake } from 'discord.js';
import GuildModel, { GuildDocument } from '../../schemas/Guild';
import parseGuild from './parseGuild';

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

export default syncGuild;
