import { inlineCode } from '@discordjs/builders';
import { ButtonInteraction, Message } from 'discord.js';
import type { FormDocument } from '../../../schemas/Form';

const formDelete = async (_form: FormDocument, interaction: ButtonInteraction) => {
	
	await _form.delete();
	const { message } = interaction;

	if (_form.creatorId !== interaction.user.id) {
		await interaction.followUp({
			content: `Only the admin or the form author can delete this form.`,
			ephemeral: true
		});
		return;
	}

	if (message instanceof Message) {
		if (message.deletable) {
			await message.delete();
			await interaction.followUp({
				content: `${inlineCode(_form.title)} successfully deleted. The instance messages are not deleted, but it will once they are used.`,
				ephemeral: true
			});
		}
	} else {
		await interaction.followUp({
			content: `Cannot find the form`,
			ephemeral: true
		});
	}
};

export default formDelete;
