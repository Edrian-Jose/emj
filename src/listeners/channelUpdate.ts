import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildChannel, NonThreadGuildBasedChannel } from 'discord.js';
import syncChannel from '../actions/Channel/syncChannel';
import { getGuildDocument } from '../actions/Guild/syncGuild';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldChannel: GuildChannel, newChannel: GuildChannel) {
		if (newChannel.guild && newChannel.parent) {
			const [_guild] = await getGuildDocument(newChannel.guild);
			if (_guild?.exempted?.channelCategory?.includes(newChannel.parent.id)) {
				return;
			}
		}
		await syncChannel(oldChannel.guild, newChannel as NonThreadGuildBasedChannel);
	}
}
