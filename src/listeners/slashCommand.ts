import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	event: 'interactionCreate'
})
export class UserEvent extends Listener {
	public async run(interaction: CommandInteraction) {
		if (!interaction.isCommand()) return;
		const command = this.container.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
}
