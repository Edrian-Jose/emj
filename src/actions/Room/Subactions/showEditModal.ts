import type { ButtonInteraction } from 'discord.js';
import editRoomModal from '../../../components/modals/editRoomModal';
import type Room from '../Room';
const { showModal } = require('discord-modals');

const showEditModal = async (room: Room, interaction: ButtonInteraction) => {
	showModal(editRoomModal(room), {
		client: interaction.client,
		interaction
	});
};

export default showEditModal;
