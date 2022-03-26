import type { ButtonInteraction } from 'discord.js';
import FormEntryModel from '../../../schemas/FormEntry';
import { getFormatString, parseValue, validateType } from '../../Form/Input/handleInputSubmit';
import FormEntry from '../FormEntry';
import entryAccept from './entryAccept';
import entryCancel from './entryCancel';
import entryConfirmSubmit from './entryConfirmSubmit';
import { deleteApplication } from './entryEdit';

const validateInputs = (entry: FormEntry): [boolean, string[]] => {
	let isValid = true;
	const errors: string[] = [];
	for (const input of entry.answers) {
		if (input.answer) {
			for (const answer of input.answer) {
				const validType = validateType(input.question._document, answer.value);
				isValid = isValid && validType;
				if (!validType) {
					errors.push(`${getFormatString(input.question._document)} for ${input.question.value}`);
				}
			}
		}
	}
	return [isValid, errors];
};

const entrySubmitModal = async (entry: FormEntry, interaction: ButtonInteraction | any) => {
	await interaction.deferReply({ ephemeral: true });
	entry.answers = entry.questions.map((question) => {
		const input = interaction.getTextInputValue(`${question._id}`);
		return {
			question: question,
			answer: input
				? [
						{
							label: input,
							value: input
						}
				  ]
				: []
		};
	});

	const [isValid, errors] = validateInputs(entry);
	if (!isValid) {
		await entryCancel(entry._document);
		await interaction.followUp({ content: errors.join(', '), ephemeral: true });
		return;
	}

	await deleteApplication(entry, interaction);

	entry._document.answers = entry.questions.map((question) => {
		const input = interaction.getTextInputValue(`${question._id}`);
		return {
			question: question._id,
			answer: input
				? [
						{
							label: input,
							value: parseValue(question._document, input)
						}
				  ]
				: []
		};
	});

	entry = new FormEntry(await entry._document.save());
	entry = new FormEntry(await FormEntryModel.getAll(entry._id));
	if (entry.form.verification) {
		await entryConfirmSubmit(entry, interaction);
		await interaction.followUp({ content: `Form submitted`, ephemeral: true });
	} else {
		await entryAccept(entry, interaction);
	}
};

export default entrySubmitModal;
