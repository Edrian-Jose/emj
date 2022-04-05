import type Room from '../../actions/Room/Room';

const { Modal, TextInputComponent } = require('discord-modals');

const threadPromptModal = (room: Room) => {
	const name = new TextInputComponent()
		.setCustomId(`thread`)
		.setLabel(`Thread Name`)
		.setStyle('SHORT')
		.setRequired(true)
		.setDefaultValue(room.name.replace(/\s+/g, '-').toLowerCase())
		.setPlaceholder(`Input the thread name here....`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___room-threadSubmit-${room._id}`)
		.setTitle(`Create Room Thread`)
		.addComponents(name);

	return modal;
};

export default threadPromptModal;
