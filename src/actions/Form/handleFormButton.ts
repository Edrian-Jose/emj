import type { FormSubActions } from './Strategies/Form';
import type { ButtonInteraction } from 'discord.js';
import FormModel, { FormDocument } from '../../schemas/Form';
import formActivate from './Subactions/formActivate';
import formDelete from './Subactions/formDelete';
import formInstanceDelete from './Subactions/formInstanceDelete';
import formCreate from './Subactions/formCreate';
import entrySubmitModal from '../FormEntry/Subactions/entrySubmitModal';

const handleFormButton = async (interaction: ButtonInteraction, type: FormSubActions, formId: FormDocument['_id']) => {

	if (type !== 'start' && type !== 'submitModal') {
		if (!interaction.deferred) {
			await interaction.deferReply({
				ephemeral: true
			});
		}
	}

	const _form = await FormModel.findById(formId).populate('questions');
	if (_form) {
		switch (type) {
			case 'activate':
				await formActivate(_form, interaction);
				break;
			case 'delete':
				await formDelete(_form, interaction);
				break;
			case 'start':
				await formCreate(_form, interaction);
				break;
			case 'submitModal':
				await entrySubmitModal(_form, interaction);
				break;
			default:
				await interaction.followUp({ content: `${_form._id}`, ephemeral: true });
				break;
		}
	} else {
		await formInstanceDelete(interaction);
	}
};

export default handleFormButton;
