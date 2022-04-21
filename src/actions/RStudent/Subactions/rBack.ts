import type { ButtonInteraction } from 'discord.js';
import rpauseModal from '../../../components/modals/rPauseModal';
import type RStudent from '../RStudent';
const { showModal } = require('discord-modals');

const rBack = async (rstudent: RStudent, interaction: ButtonInteraction) => {
	showModal(rpauseModal(rstudent), {
		client: interaction.client,
		interaction
	});
};

export default rBack;
