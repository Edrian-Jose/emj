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
import entrySubmit from './Subactions/entrySubmit';
import updateNavigator from './Navigator/updateNavigator';
import entryConfirmSubmit from './Subactions/entryConfirmSubmit';
import formInstanceDelete from '../Form/Subactions/formInstanceDelete';

const handleEntryButton = async (interaction: ButtonInteraction, type: EntrySubActions, entryId: FormEntryDocument['_id']) => {
	await interaction.deferUpdate();
	const _entry = await FormEntryModel.getAll(entryId);
	const entry = new FormEntry(_entry);

	if (entry.ownerId !== interaction.user.id) {
		await interaction.followUp({
			content: `You are not the owner of this form entry.`,
			ephemeral: true
		});
	} else if (_entry) {
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
			case 'submit':
				await entrySubmit(entry, interaction);
				break;
			case 'cancel':
				await entryCancel(_entry);
				break;
			case 'confirmSubmit':
				await entryConfirmSubmit(entry, interaction);
				break;
			default:
				await updateNavigator(interaction, entry._id);
				break;
		}
	} else {
		// entry cancel
		await formInstanceDelete(interaction);
		await interaction.followUp({ content: `Error occured. Must delete the form`, ephemeral: true });
	}
};

export default handleEntryButton;
