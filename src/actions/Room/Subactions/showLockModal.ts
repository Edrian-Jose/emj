import type { ButtonInteraction } from 'discord.js';
import createPasswordModal from '../../../components/modals/lockModal';
import type Room from '../Room';
const { showModal } = require('discord-modals');

const showLockModal = async (room: Room, interaction: ButtonInteraction) => {
	showModal(createPasswordModal(`___room-lockSubmit-${room._id}`), {
		client: interaction.client,
		interaction
	});
};

export default showLockModal;
