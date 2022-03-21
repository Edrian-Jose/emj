import type { QuestionDocument } from './../../../schemas/Question';
import type { ButtonInteraction } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import Prompt from '../Strategies/Prompt';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
const { showModal } = require('discord-modals');

const handleInputButton = async (interaction: ButtonInteraction, questionId: QuestionDocument['_id'], formId: FormEntryDocument['_id']) => {
	const question = await QuestionModel.findById(questionId);
	if (question) {
		const prompt = new Prompt(formId, question);
		showModal(prompt.createInputModal(), {
			client: interaction.client,
			interaction
		});
	}
};

export default handleInputButton;
