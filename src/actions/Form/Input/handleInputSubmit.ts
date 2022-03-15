import type { FormDocument } from './../../../schemas/Form';
import type { QuestionDocument } from './../../../schemas/Question';
import type { ButtonInteraction, Message } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import Prompt from '../Strategies/Prompt';

const handleInputSubmit = async (interaction: ButtonInteraction | any, questionId: QuestionDocument['_id'], formId: FormDocument['_id']) => {
	const message = interaction.message as Message;
	const input: string = interaction.getTextInputValue(`input`);
	const question = await QuestionModel.findById(questionId);

	await interaction.deferReply({ ephemeral: true });

	if (question) {
		const prompt = new Prompt(formId, question);
		//TODO: perform type checking here
		const embed = message.embeds[0];
		if (input) {
			if (embed.fields[0] && embed.fields[0].name === 'Recorded Input') {
				embed.fields[0].value = input;
			} else {
				embed.addField('Input Value', input);
			}
		} else {
			if (embed.fields[0] && embed.fields[0].name === 'Recorded Input') {
				embed.fields.splice(0, 1);
			}
		}

		message.edit({ embeds: [embed], components: prompt.createComponents(Boolean(input)) });

		return await interaction.followUp({
			content: input ? `Input recorded` : 'Input cleared',
			ephemeral: true
		});
	}

	return await interaction.followUp({
		content: `Error occured. Try again`,
		ephemeral: true
	});
};

export default handleInputSubmit;
