import moment from 'moment';
import type Room from '../../actions/Room/Room';

const { Modal, TextInputComponent } = require('discord-modals');

const eventPromptModal = (room: Room) => {
	const name = new TextInputComponent()
		.setCustomId(`name`)
		.setLabel(`Event Name`)
		.setStyle('SHORT')
		.setRequired(true)
		.setDefaultValue(room.name)
		.setPlaceholder(`Input the event name here....`);

	const time = new TextInputComponent()
		.setCustomId(`startTime`)
		.setLabel(`Datetime Start (MM/DD/YYYY h:mm A)`)
		.setStyle('SHORT')
		.setRequired(true)
		.setDefaultValue(moment().format('MM/DD/YYYY h:mm A'))
		.setPlaceholder(`e.g. 12/30/2000 1:16 AM`);

	const desc = new TextInputComponent()
		.setCustomId(`desc`)
		.setLabel(`Description`)
		.setStyle('LONG')
		.setRequired(false)
		.setDefaultValue(room.description ?? '')
		.setPlaceholder(`Event description goes here....`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___room-threadSubmit-${room._id}`)
		.setTitle(`Create Thread`)
		.addComponents(name, time, desc);

	return modal;
};

export default eventPromptModal;
