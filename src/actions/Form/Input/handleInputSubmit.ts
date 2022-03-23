import type { QuestionDocument } from './../../../schemas/Question';
import type { ButtonInteraction, Message } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import FormEntryModel from '../../../schemas/FormEntry';
import updateNavigator from '../../FormEntry/Navigator/updateNavigator';
import moment from 'moment';

const validateType = (question: QuestionDocument, input: string): boolean => {
	switch (question.type) {
		case 'BOOLEAN':
			return ['true', 'false'].includes(input);
		case 'NUMBER':
			if (typeof input != 'string') return false;
			return !isNaN(parseFloat(input));
		case 'DATE':
			const dFormats = ['MM/DD/YYYY'];
			return moment(input, dFormats, true).isValid();
		case 'DATETIME':
			const dtFormats = ['MM/DD/YYYY h:mm A'];
			return moment(input, dtFormats, true).isValid();
		default:
			return true;
	}
};

const parseValues = (question: QuestionDocument, input: string) => {
	switch (question.type) {
		case 'NUMBER':
			return parseFloat(input).toString();
		case 'DATE':
			const dFormats = ['MM/DD/YYYY'];
			return moment(input, dFormats, true).valueOf().toString();
		case 'DATETIME':
			const dtFormats = ['MM/DD/YYYY h:mm A'];
			return moment(input, dtFormats, true).valueOf().toString();
		default:
			return input;
	}
};

const getFormatString = (question: QuestionDocument) => {
	switch (question.type) {
		case 'NUMBER':
			return `The input should be a valid number (e.g. 1, 0, 3.5)`;
		case 'DATE':
			return `The input should be in the format of 'MM/DD/YYYY' (e.g. 01/13/1999)`;
		case 'DATETIME':
			return `The input should be in the format of 'MM/DD/YYYY h:mm A' (e.g. 01/13/1999 1:16 PM)`;
		default:
			return ``;
	}
};

const handleInputSubmit = async (interaction: ButtonInteraction | any, questionId: QuestionDocument['_id'], formId: FormEntryDocument['_id']) => {
	const message = interaction.message as Message;
	const input: string = interaction.getTextInputValue(`input`);
	const question = await QuestionModel.findById(questionId);
	const _formEntry = await FormEntryModel.getAll(formId);
	await interaction.deferReply({ ephemeral: true });

	if (!_formEntry || !_formEntry.form) {
		await message.delete();
		return await interaction.followUp({
			content: ` You can't use the form. Looks like the form is deleted`,
			ephemeral: true
		});
	}

	if (question && _formEntry) {
		if (input) {
			if (!validateType(question, input)) {
				return await interaction.followUp({
					content: `Wrong format or data type. ${getFormatString(question)}`,
					ephemeral: true
				});
			}
			const index = _formEntry.answers.findIndex((answer) => answer.question._id == questionId);
			if (index >= 0 && _formEntry.answers[index]) {
				_formEntry.answers[index].answer = [
					{
						label: input,
						value: parseValues(question, input)
					}
				];
			} else {
				_formEntry.answers.push({
					question,
					answer: [
						{
							label: input,
							value: parseValues(question, input)
						}
					]
				});
			}
		} else {
			const index = _formEntry.answers.findIndex((answer) => answer.question._id == questionId);
			_formEntry.answers[index] = {
				question
			};
		}
		await _formEntry.save();
		await updateNavigator(interaction, formId);
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
