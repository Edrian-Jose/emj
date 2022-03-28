const { Modal, TextInputComponent } = require('discord-modals');

const createDenyModal = (customId: string) => {
	const reasonComponent = new TextInputComponent()
		.setCustomId(`reason`)
		.setLabel(`Reason`)
		.setStyle('LONG')
		.setRequired(true)
		.setPlaceholder(`Make the reason compact and simple. (e.g. Not following instructions)`);

	const recommendationComponent = new TextInputComponent()
		.setCustomId(`recommendation`)
		.setLabel(`Recommendation`)
		.setStyle('LONG')
		.setRequired(false)
		.setPlaceholder(`Give recommendations to correct the problem or just elaborate the problem here.`);

	const modal = new Modal() // We create a Modal
		.setCustomId(customId)
		.setTitle(`Reason for Denial form`)
		.addComponents(reasonComponent, recommendationComponent);

	return modal;
};

export default createDenyModal;
