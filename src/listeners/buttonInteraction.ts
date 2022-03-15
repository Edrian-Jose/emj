import { executeButton } from './../actions/Button/executeButton';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Interaction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	event: 'interactionCreate'
})
export class UserEvent extends Listener {
	public run(interaction: Interaction) {
		if (!interaction.isButton()) return;

		executeButton(interaction);
	}
}
