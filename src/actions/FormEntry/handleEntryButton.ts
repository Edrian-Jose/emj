import FormEntryModel from './../../schemas/FormEntry';

import type { ButtonInteraction } from 'discord.js';
import type { FormEntryDocument } from '../../schemas/FormEntry';

import type { EntrySubActions } from './FormEntry';
import FormEntry from './FormEntry';
import entrySkip from './Subactions/entrySkip';

const handleEntryButton = async (interaction: ButtonInteraction, type: EntrySubActions, entryId: FormEntryDocument['_id']) => {
	await interaction.deferUpdate();
	const _entry = await FormEntryModel.getAll(entryId);
	const entry = new FormEntry(_entry);
	if (_entry) {
		switch (type) {
			case 'skip':
				await entrySkip(entry, interaction);
				break;
			default:
				//Cancel
				await interaction.followUp({ content: `${entry._id}`, ephemeral: true });
				break;
		}
	} else {
		//entry cancel
		// await formInstanceDelete(interaction);
		await interaction.followUp({ content: `Error occured. Must delete the form`, ephemeral: true });
	}
};

export default handleEntryButton;
