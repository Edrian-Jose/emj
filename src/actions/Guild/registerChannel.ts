import type { CommandInteraction, Message } from 'discord.js';
import { getGuildDocument } from './syncGuild';

export type UtilityChannelTypes = 'desk' | 'inquiries' | 'applications' | 'forms' | 'welcome' | 'teams' | 'rooms' | 'threads';
export const registerUtilityChannel = async (source: Message | CommandInteraction, utility: UtilityChannelTypes) => {
	const { channel, guild } = source;
	if (guild) {
		const [_guild] = await getGuildDocument(guild);
		if (_guild && channel) {
			_guild.channels[utility] = channel.id;
			await _guild.save();
		}
		return _guild;
	}

	return null;
};
