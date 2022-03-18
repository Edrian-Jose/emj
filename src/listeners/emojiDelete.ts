import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildEmoji } from 'discord.js';
import syncEmoji from '../actions/Emoji/syncEmoji';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(emoji: GuildEmoji) {
		await syncEmoji(emoji.guild, emoji.id);
	}
}
