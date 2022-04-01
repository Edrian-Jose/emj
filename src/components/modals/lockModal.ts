const { Modal, TextInputComponent } = require('discord-modals');

const createPasswordModal = (customId: string) => {
	const passComponent = new TextInputComponent()
		.setCustomId(`passcode`)
		.setLabel(`Create a passcode`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(`You will not share any password here. You will create one`);

	const hintComponent = new TextInputComponent()
		.setCustomId(`hint`)
		.setLabel(`Hint for the passcode (if any)`)
		.setStyle('LONG')
		.setRequired(false)
		.setPlaceholder(`The input value here will be used as a placeholder for the password input`);

	const modal = new Modal() // We create a Modal
		.setCustomId(customId)
		.setTitle(`Passcode Creator`)
		.addComponents(passComponent, hintComponent);

	return modal;
};

export default createPasswordModal;
