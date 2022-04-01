const { Modal, TextInputComponent } = require('discord-modals');

const passcodePromptModal = (customId: string, hint?: string) => {
	const passComponent = new TextInputComponent()
		.setCustomId(`passcode`)
		.setLabel(`Passcode`)
		.setStyle('SHORT')
		.setRequired(true)
		.setPlaceholder(hint ? `HINT: ${hint}` : `Input the passcode here....`);

	const modal = new Modal() // We create a Modal
		.setCustomId(customId)
		.setTitle(`Passcode Prompt`)
		.addComponents(passComponent);

	return modal;
};

export default passcodePromptModal;
