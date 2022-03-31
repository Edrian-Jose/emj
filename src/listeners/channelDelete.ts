import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildChannel } from 'discord.js';
import syncChannel from '../actions/Channel/syncChannel';
import { getGuildDocument } from '../actions/Guild/syncGuild';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(channel: GuildChannel) {
		if (channel.guild && channel.parent) {
			const [_guild] = await getGuildDocument(channel.guild);
			if (_guild?.exempted.channelCategory.includes(channel.parent.id)) {
				return;
			}
		}
		await syncChannel(channel.guild, channel.id);
	}
}
