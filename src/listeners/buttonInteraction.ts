import { executeButton } from './../actions/Button/executeButton';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Interaction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	event: 'interactionCreate'
})
export class UserEvent extends Listener {
	public async run(interaction: Interaction) {
		try {
			if (!interaction.channel || (interaction.channel?.isThread() && interaction.channel.archived)) {
				return;
			}

			if (!interaction.isButton()) return;

			executeButton(interaction);
		} catch (error) {
			console.log(error);
		}
		
	}
}
