import { channelMention } from '@discordjs/builders';
import type { CommandInteraction, Message } from 'discord.js';
import log from '../General/log';
import { getGuildDocument } from './syncGuild';

export type UtilityChannelTypes =
	| 'desk'
	| 'inquiries'
	| 'applications'
	| 'forms'
	| 'welcome'
	| 'teams'
	| 'rooms'
	| 'threads'
	| 'feeds'
	| 'apps'
	| 'logs';
export const registerUtilityChannel = async (source: Message | CommandInteraction, utility: UtilityChannelTypes) => {
	const { channel, guild } = source;
	if (guild) {
		const [_guild] = await getGuildDocument(guild);
		if (_guild && channel) {
			_guild.channels[utility] = channel.id;
			await log(
				guild,
				`${source.member!.user.username} use !setup ${utility}`,
				`${utility} channel set to ${channelMention(_guild.channels[utility])}`,
				source.member!.user.id
			);
			await _guild.save();
		}

		return _guild;
	}

	return null;
};
