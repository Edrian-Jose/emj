import type { ButtonInteraction } from 'discord.js';
import waitingApproval from '../../../components/embeds/waitingApproval';
import type FormEntry from '../FormEntry';
import updateNavigator from '../Navigator/updateNavigator';

const entryConfirmSubmit = async (entry: FormEntry, interaction: ButtonInteraction) => {
	const options = { embeds: [waitingApproval(entry)], components: entry.createWaitComponents() };
	updateNavigator(interaction, entry._id, options);
};

export default entryConfirmSubmit;
