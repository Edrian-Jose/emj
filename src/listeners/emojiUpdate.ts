import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildEmoji } from 'discord.js';
import syncEmoji from '../actions/Emoji/syncEmoji';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldEmoji: GuildEmoji, newEmoji: GuildEmoji) {
		await syncEmoji(oldEmoji.guild, newEmoji);
	}
}
