import type { ButtonInteraction } from 'discord.js';
import confirmForm from '../../../components/embeds/confirmForm';
import type FormEntry from '../FormEntry';
import updateNavigator from '../Navigator/updateNavigator';

const entrySubmit = async (entry: FormEntry, interaction: ButtonInteraction) => {
	const options = { embeds: [confirmForm(entry, entry.form)], components: entry.createSubmitComponents() };
	updateNavigator(interaction, entry._id, options);
};

export default entrySubmit;
