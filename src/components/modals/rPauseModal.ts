import type RStudent from '../../actions/RStudent/RStudent';

const { Modal, TextInputComponent } = require('discord-modals');

const rpauseModal = (rstudent: RStudent) => {
	const pauseComponent = new TextInputComponent()
		.setCustomId(`date`)
		.setLabel(`Dropped Date`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(`e.g. MM/DD/YYYY`);

	const reasonComponent = new TextInputComponent()
		.setCustomId(`reason`)
		.setLabel(`Reason`)
		.setStyle('LONG')
		.setRequired(false)
		.setPlaceholder(`e.g. Don't want to continue`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___r-pauseSubmit-${rstudent._id}`)
		.setTitle(`Drop ${rstudent.reference}`)
		.addComponents(pauseComponent, reasonComponent);

	return modal;
};

export default rpauseModal;
