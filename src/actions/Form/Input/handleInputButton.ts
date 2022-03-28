import FormEntryModel from './../../../schemas/FormEntry';
import type { QuestionDocument } from './../../../schemas/Question';
import type { ButtonInteraction } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import Prompt from '../Strategies/Prompt';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
const { showModal } = require('discord-modals');

const handleInputButton = async (interaction: ButtonInteraction, questionId: QuestionDocument['_id'], entryId: FormEntryDocument['_id']) => {
	const question = await QuestionModel.findById(questionId);
	const _formEntry = await FormEntryModel.getAll(entryId);
	if (_formEntry && _formEntry.ownerId !== interaction.user.id) {
		await interaction.reply({
			content: `You are not the owner of this form entry.`,
			ephemeral: true
		});
	} else if (question) {
		const prompt = new Prompt(entryId, question);
		showModal(prompt.createInputModal(), {
			client: interaction.client,
			interaction
		});
	}
};

export default handleInputButton;
