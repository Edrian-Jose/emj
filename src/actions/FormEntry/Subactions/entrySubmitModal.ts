import type { ButtonInteraction } from 'discord.js';
import FormEntryModel from '../../../schemas/FormEntry';
import FormEntry from '../FormEntry';
import entryAccept from './entryAccept';
import entryConfirmSubmit from './entryConfirmSubmit';
import { deleteApplication } from './entryEdit';

const entrySubmitModal = async (entry: FormEntry, interaction: ButtonInteraction | any) => {
	await interaction.deferReply({ ephemeral: true });
	await deleteApplication(entry, interaction);
	entry._document.answers = entry.questions.map((question) => {
		const input = interaction.getTextInputValue(`${question._id}`);
		return {
			question: question._id,
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
