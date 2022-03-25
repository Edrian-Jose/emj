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
import entryUpvote from './Subactions/entryUpvote';
import entryDownvote from './Subactions/entryDownvote';
import entryApprove from './Subactions/entryApprove';
import entryDeny from './Subactions/entryDeny';
import entryEdit from './Subactions/entryEdit';
import entryDenyModal from './Subactions/entryDenyModal';
import entryAccept from './Subactions/entryAccept';

const handleEntryButton = async (interaction: ButtonInteraction, type: EntrySubActions, entryId: FormEntryDocument['_id']) => {
	if (type !== 'denyModal' && type !== 'deny') {
		await interaction.deferUpdate();
	}

	const _entry = await FormEntryModel.getAll(entryId);
	const entry = new FormEntry(_entry);
	const verifiers = entry.verifiers;

	// verifier and not owner
	if (verifiers && verifiers.includes(interaction.user.id) && entry.ownerId !== interaction.user.id) {
		switch (type) {
			case 'upvote':
				await entryUpvote(entry, interaction);
				break;
			case 'downvote':
				await entryDownvote(interaction);
				break;
			case 'approve':
				await entryApprove(entry, interaction);
				break;
			case 'deny':
				await entryDeny(entry, interaction);
				break;
			case 'denyModal':
				await entryDenyModal(entry, interaction);
				break;
			default:
				await interaction.followUp({
					content: `You are not the owner of this form entry.`,
					ephemeral: true
				});
				break;
		}
		// not verifier and not owner
	} else if (entry.ownerId !== interaction.user.id) {
		await interaction.followUp({
			content: `You are not the owner or a verifier of this form entry.`,
			ephemeral: true
		});
		// verifier and owner or not verifier but owner
	} else if (_entry) {
		if (['upvote', 'downvote', 'approve', 'deny', 'denyModal'].includes(type)) {
			if (type == 'denyModal' || type == 'deny') {
				await interaction.deferUpdate();
			}
			await interaction.followUp({
				content: `You cannot verify your form entry.`,
				ephemeral: true
			});
		} else {
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
				case 'edit':
					await entryEdit(entry, interaction);
					break;
				case 'accept':
					await entryAccept(entry, interaction);
					break;
				default:
					await updateNavigator(interaction, entry._id);
					break;
			}
		}
	} else {
		// entry cancel
		await formInstanceDelete(interaction);
		await interaction.followUp({ content: `Error occured. Must delete the form`, ephemeral: true });
	}
};

export default handleEntryButton;
