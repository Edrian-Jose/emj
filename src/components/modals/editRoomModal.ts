import type Room from '../../actions/Room/Room';

const { Modal, TextInputComponent } = require('discord-modals');

const editRoomModal = (room: Room) => {
	const emojiComponent = new TextInputComponent()
		.setCustomId(`emoji`)
		.setLabel(`Prefix Emoji`)
		.setDefaultValue(room.emoji)
		.setStyle('SHORT')
		.setRequired(true)
		.setMaxLength(2)
		.setPlaceholder(`One length emoji`);

	const descriptionComponent = new TextInputComponent()
		.setCustomId(`desc`)
		.setLabel(`Description`)
		.setDefaultValue(room.description ?? '')
		.setStyle('LONG')
		.setRequired(false)
		.setPlaceholder(`Describe the room or its purpose`);

	const nameComponent = new TextInputComponent()
		.setCustomId(`name`)
		.setLabel(`Name`)
		.setDefaultValue(room.name)
		.setStyle('SHORT')
		.setRequired(true)
		.setMaxLength(14)
		.setPlaceholder(`e.g. Party Room`);

	const passComponent = new TextInputComponent()
		.setCustomId(`passcode`)
		.setLabel(`Passcode`)
		.setStyle('SHORT')
		.setRequired(false)
		.setPlaceholder(`Leave blank if you don't want to set or change the passcode`);

	const cohostComponent = new TextInputComponent()
		.setCustomId(`cohost`)
		.setLabel(`Co-host ID`)
		.setStyle('SHORT')
		.setDefaultValue(room.cohost ?? '')
		.setMaxLength(18)
		.setRequired(false)
		.setPlaceholder(`Leave blank if you don't want to change the current cohost`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___room-editSubmit-${room._id}`)
		.setTitle(`Edit Room Settings`)
		.addComponents(nameComponent, emojiComponent, cohostComponent, passComponent, descriptionComponent);

	return modal;
};

export default editRoomModal;
