import type { FormSubActions } from './Strategies/Form';
import type { ButtonInteraction } from 'discord.js';
import FormModel, { FormDocument } from '../../schemas/Form';
import formActivate from './Subactions/formActivate';
import formDelete from './Subactions/formDelete';
import formInstanceDelete from './Subactions/formInstanceDelete';

const handleFormButton = async (interaction: ButtonInteraction, type: FormSubActions, formId: FormDocument['_id']) => {

	const _form = await FormModel.findById(formId).populate('questions');
	if (_form) {
		switch (type) {
			case 'activate':
				await formActivate(_form, interaction);
				break;
			case 'delete':
				await formDelete(_form, interaction);
				break;
			default:
				await interaction.reply({ content: `${_form._id}`, ephemeral: true });
				break;
		}
	} else {
		await formInstanceDelete(interaction);
	}
};

export default handleFormButton;
