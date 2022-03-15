import type { FormDocument } from './../../../schemas/Form';
import type { QuestionDocument } from './../../../schemas/Question';
import type { ButtonInteraction } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import Prompt from '../Strategies/Prompt';
const { showModal } = require('discord-modals');

const handleInputButton = async (interaction: ButtonInteraction, questionId: QuestionDocument['_id'], formId: FormDocument['_id']) => {
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
