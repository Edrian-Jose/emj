import { inlineCode } from '@discordjs/builders';
import { ButtonInteraction, Message } from 'discord.js';
import type { FormDocument } from '../../../schemas/Form';

const formDelete = async (_form: FormDocument, interaction: ButtonInteraction) => {
	await _form.delete();
	const { message } = interaction;
	if (message instanceof Message) {
		if (message.deletable) {
			await message.delete();
			await interaction.reply({
				content: `${inlineCode(_form.title)} successfully deleted. The instance messages are not deleted, but it will once they are used.`,
				ephemeral: true
			});
		}
	} else {
		await interaction.reply({
			content: `Cannot find the form`,
			ephemeral: true
		});
	}
};

export default formDelete;
