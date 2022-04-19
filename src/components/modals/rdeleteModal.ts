import type RStudent from '../../actions/RStudent/RStudent';

const { Modal, TextInputComponent } = require('discord-modals');

const rdeleteModal = (rstudent: RStudent) => {
	const reasonComponent = new TextInputComponent()
		.setCustomId(`reason`)
		.setLabel(`Reason`)
		.setStyle('LONG')
		.setRequired(true)
		.setPlaceholder(`e.g. Duplicate Entry, wrong reference, etc`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___r-delSubmit-${rstudent._id}`)
		.setTitle(`Delete ${rstudent.reference}`)
		.addComponents(reasonComponent);

	return modal;
};

export default rdeleteModal;
