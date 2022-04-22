import type RStudent from '../../actions/RStudent/RStudent';

const { Modal, TextInputComponent } = require('discord-modals');

const rEndModal = (rstudent: RStudent) => {
	const dakoComponent = new TextInputComponent()
		.setCustomId(`dako`)
		.setLabel(`Dako ng Bautismo`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(`e.g. Lokal ng Bagong Buhay`);

	const petsaComponent = new TextInputComponent()
		.setCustomId(`petsa`)
		.setLabel(`Petsa ng Bautismo`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(`MM/DD/YYYY`);

	const buwanComponent = new TextInputComponent()
		.setCustomId(`buwan`)
		.setLabel(`Buwan Ipinasa`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(`JAN, FEB, ...etc`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___r-endSubmit-${rstudent._id}`)
		.setTitle(`Mark as Finished ${rstudent.reference}`)
		.addComponents(dakoComponent, petsaComponent, buwanComponent);

	return modal;
};

export default rEndModal;
