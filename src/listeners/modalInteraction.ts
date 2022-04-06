import { handleModalSubmit } from './../actions/Modal/handleModalSubmit';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	event: 'modalSubmit'
})
export class UserEvent extends Listener {
	public run(interaction: ButtonInteraction) {
		try {
			handleModalSubmit(interaction);
		} catch (error) {}
		
	}
}
