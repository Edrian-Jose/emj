import type { ButtonInteraction } from 'discord.js';
import eventPromptModal from '../../../components/modals/eventPromptModal';
import type Room from '../Room';
const { showModal } = require('discord-modals');

const showEventModal = async (room: Room, interaction: ButtonInteraction) => {
	showModal(await eventPromptModal(room), {
		client: interaction.client,
		interaction
	});
};

export default showEventModal;
