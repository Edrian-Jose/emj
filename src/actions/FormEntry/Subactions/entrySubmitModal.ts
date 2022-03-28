import type { ButtonInteraction } from 'discord.js';
import type { FormDocument } from '../../../schemas/Form';
import FormEntryModel from '../../../schemas/FormEntry';
import { getFormatString, parseValue, validateType } from '../../Form/Input/handleInputSubmit';
import { formInstantiate } from '../../Form/Subactions/formCreate';
import FormEntry from '../FormEntry';
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

const getAnswers = async (entry: FormEntry, interaction: ButtonInteraction & { getTextInputValue: Function }) => {
	return entry.questions.map((question) => {
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
};

export const entryEditModal = async (entry: FormEntry, interaction: ButtonInteraction | any, newEntry = false) => {
	await interaction.deferReply({ ephemeral: true });

	entry.answers = await getAnswers(entry, interaction);
	const [isValid, errors] = validateInputs(entry);
	if (!isValid) {
		if (newEntry) {
			await entryCancel(entry._document);
		}
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
	await entryConfirmSubmit(entry, interaction);
	if (entry.form.verification) {
		await interaction.followUp({ content: `Form submitted`, ephemeral: true });
	}
};

const entrySubmitModal = async (_form: FormDocument, interaction: ButtonInteraction | any) => {
	const { user } = interaction;
	const _formEntry = await formInstantiate(user, _form);
	let entry = new FormEntry(_formEntry);
	await entryEditModal(entry, interaction, true);
};

export default entrySubmitModal;
