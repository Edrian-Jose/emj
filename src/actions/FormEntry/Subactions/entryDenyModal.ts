import type { ButtonInteraction } from 'discord.js';
import createDenyModal from '../../../components/modals/denyModal';
import type FormEntry from '../FormEntry';
const { showModal } = require('discord-modals');

const entryDenyModal = async (entry: FormEntry, interaction: ButtonInteraction) => {
	showModal(createDenyModal(`___entry-deny-${entry._id}`), {
		client: interaction.client,
		interaction
	});
};

export default entryDenyModal;
