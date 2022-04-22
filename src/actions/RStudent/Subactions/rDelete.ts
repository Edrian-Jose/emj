import type { ButtonInteraction } from 'discord.js';
import rdeleteModal from '../../../components/modals/rdeleteModal';
import type RStudent from '../RStudent';
const { showModal } = require('discord-modals');

const rDelete = async (rstudent: RStudent, interaction: ButtonInteraction) => {
	showModal(rdeleteModal(rstudent), {
		client: interaction.client,
		interaction
	});
};

export default rDelete;
