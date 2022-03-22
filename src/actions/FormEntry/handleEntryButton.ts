import FormEntryModel from './../../schemas/FormEntry';

import type { ButtonInteraction } from 'discord.js';
import type { FormEntryDocument } from '../../schemas/FormEntry';

import type { EntrySubActions } from './FormEntry';
import FormEntry from './FormEntry';
import entrySkip from './Subactions/entrySkip';
import entryCancel from './Subactions/entryCancel';
import entryBack from './Subactions/entryBack';
import entryNext from './Subactions/entryNext';
import entryClear from './Subactions/entryClear';

const handleEntryButton = async (interaction: ButtonInteraction, type: EntrySubActions, entryId: FormEntryDocument['_id']) => {
	await interaction.deferUpdate();
	const _entry = await FormEntryModel.getAll(entryId);
	const entry = new FormEntry(_entry);
	if (_entry) {
		switch (type) {
			case 'clear':
				await entryClear(entry, interaction);
				break;
			case 'skip':
				await entrySkip(entry, interaction);
				break;
			case 'back':
				await entryBack(entry, interaction);
				break;
			case 'next':
				await entryNext(entry, interaction);
				break;
			default:
				await entryCancel(_entry);
				break;
		}
	} else {
		//entry cancel
		// await formInstanceDelete(interaction);
		await interaction.followUp({ content: `Error occured. Must delete the form`, ephemeral: true });
	}
};

export default handleEntryButton;
