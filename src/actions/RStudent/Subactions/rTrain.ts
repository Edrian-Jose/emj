import type { ButtonInteraction } from 'discord.js';
import rtrainModal from '../../../components/modals/rtrainModal';
import type RStudent from '../RStudent';
const { showModal } = require('discord-modals');

const rTrain = async (rstudent: RStudent, interaction: ButtonInteraction) => {
	showModal(rtrainModal(rstudent), {
		client: interaction.client,
		interaction
	});
};

export default rTrain;
