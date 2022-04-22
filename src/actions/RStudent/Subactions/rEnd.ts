import type { ButtonInteraction } from 'discord.js';
import rEndModal from '../../../components/modals/rEndModal';
import type RStudent from '../RStudent';
const { showModal } = require('discord-modals');

const rEnd = async (rstudent: RStudent, interaction: ButtonInteraction) => {
	showModal(rEndModal(rstudent), {
		client: interaction.client,
		interaction
	});
};

export default rEnd;
