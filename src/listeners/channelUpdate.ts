import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildChannel, NonThreadGuildBasedChannel } from 'discord.js';
import syncChannel from '../actions/Channel/syncChannel';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldChannel: GuildChannel, newChannel: GuildChannel) {
		await syncChannel(oldChannel.guild, newChannel as NonThreadGuildBasedChannel);
	}
}
