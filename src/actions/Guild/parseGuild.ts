import { container } from '@sapphire/framework';
import type { Guild, Snowflake } from 'discord.js';

const parseGuild = async (guildResolvable: Snowflake | Guild): Promise<Guild> => {
	let guild: Guild | null = null;

	if (typeof guildResolvable === 'string') {
		guild = await container.client.guilds.fetch(guildResolvable);
	} else {
		guild = guildResolvable;
	}

	return guild;
};

export default parseGuild;
