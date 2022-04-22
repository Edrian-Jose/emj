import type RStudent from '../../actions/RStudent/RStudent';

const { Modal, TextInputComponent } = require('discord-modals');

const rtrainModal = (rstudent: RStudent) => {
	const trainComponent = new TextInputComponent()
		.setCustomId(`date`)
		.setLabel(`Pre-Screening Date`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(`MM/DD/YYYY`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___r-trainSubmit-${rstudent._id}`)
		.setTitle(`Train ${rstudent.reference}`)
		.addComponents(trainComponent);

	return modal;
};

export default rtrainModal;
