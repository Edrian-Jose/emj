import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Interaction } from 'discord.js';
import { executeSelect } from '../actions/Select/executeSelect';

@ApplyOptions<ListenerOptions>({
	event: 'interactionCreate'
})
export class UserEvent extends Listener {
	public run(interaction: Interaction) {
		try {
			if (!interaction.channel || (interaction.channel?.isThread() && interaction.channel.archived)) {
				return;
			}
			if (!interaction.isSelectMenu()) return;

			executeSelect(interaction);
		} catch (error) {}
		
	}
}
