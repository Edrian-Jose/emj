import type RStudent from '../../actions/RStudent/RStudent';

const { Modal, TextInputComponent } = require('discord-modals');

const rbackModal = (rstudent: RStudent) => {
	const dakoComponent = new TextInputComponent()
		.setCustomId(`dako`)
		.setLabel(`Dako ng Gawain`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(`e.g. Dako ng Ferrer`);

	const orasComponent = new TextInputComponent()
		.setCustomId(`oras`)
		.setLabel(`Oras ng Gawain`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(`e.g. 2:00 PM`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___r-backSubmit-${rstudent._id}`)
		.setTitle(`Readmit ${rstudent.reference}`)
		.addComponents(dakoComponent, orasComponent);

	return modal;
};

export default rbackModal;
