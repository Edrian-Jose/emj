import type { ButtonInteraction } from 'discord.js';
import passcodePromptModal from '../../../components/modals/passModal';
import type Room from '../Room';
const { showModal } = require('discord-modals');

const showPasscodeModal = async (room: Room, interaction: ButtonInteraction, type: string) => {
	showModal(passcodePromptModal(`___room-${type}-${room._id}`, room.hint), {
		client: interaction.client,
		interaction
	});
};

export default showPasscodeModal;
