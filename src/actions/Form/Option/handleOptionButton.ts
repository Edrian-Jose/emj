import FormEntryModel from './../../../schemas/FormEntry';
import type { ButtonInteraction, Message } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import updateNavigator from '../../FormEntry/Navigator/updateNavigator';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';

const handleOptionButton = async (
	interaction: ButtonInteraction,
	questionId: string,
	entryId: string,
	...values: string[]
): Promise<APIMessage | Message> => {
	const value = values.join('-');
	const message = interaction.message as Message;
	const question = await QuestionModel.findById(questionId);
	const _formEntry = await FormEntryModel.getAll(entryId);

	await interaction.deferReply({ ephemeral: true });

	if (!_formEntry || !_formEntry.form) {
		await message.delete();
		return await interaction.followUp({
			content: ` You can't use the form. Looks like the form is deleted`,
			ephemeral: true
		});
	}

	if (question && _formEntry) {
		const option = question.options?.find((option) => option.value == value);
		const index = _formEntry.answers.findIndex((answer) => answer.question._id == questionId);
		if (option) {
			if (index >= 0 && _formEntry.answers[index]) {
				_formEntry.answers[index].answer = [
					{
						label: option.label,
						value: option.value
					}
				];
			} else {
				_formEntry.answers.push({
					question,
					answer: [option]
				});
			}
		} else {
			_formEntry.answers[index] = {
				question
			};
		}

		await _formEntry.save();
		await updateNavigator(interaction, entryId);
		return await interaction.followUp({
			content: option ? `Input recorded` : 'Input cleared',
			ephemeral: true
		});
	}
	return await interaction.followUp({
		content: `Error occured. Try again`,
		ephemeral: true
	});
};

export default handleOptionButton;
