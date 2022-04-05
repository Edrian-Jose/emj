import type { ButtonInteraction } from 'discord.js';
import threadPromptModal from '../../../components/modals/threadPromptModal';
import type Room from '../Room';
const { showModal } = require('discord-modals');

const showThreadModal = async (room: Room, interaction: ButtonInteraction) => {
	showModal(threadPromptModal(room), {
		client: interaction.client,
		interaction
	});
};

export default showThreadModal;
