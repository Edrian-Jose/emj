import type { ButtonInteraction } from 'discord.js';
import rbackModal from '../../../components/modals/rbackModal';
import type RStudent from '../RStudent';
const { showModal } = require('discord-modals');

const rBack = async (rstudent: RStudent, interaction: ButtonInteraction) => {
	showModal(rbackModal(rstudent), {
		client: interaction.client,
		interaction
	});
};

export default rBack;
