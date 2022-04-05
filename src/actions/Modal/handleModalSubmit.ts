import type { ButtonInteraction } from 'discord.js';
import handleFormButton from '../Form/handleFormButton';
import handleInputSubmit from '../Form/Input/handleInputSubmit';
import handleEntryButton from '../FormEntry/handleEntryButton';
import handleRoomButton from '../Room/handleRoomButton';

interface Interactions {
	[name: string]: Function;
}

const customInteractions: Interactions = {
	input: handleInputSubmit,
	form: handleFormButton,
	entry: handleEntryButton,
	room: handleRoomButton
};
const interactions: Interactions = {};

export const handleModalSubmit = (interaction: ButtonInteraction) => {
	const customId = interaction.customId;
	let args: string[] = [];
	let interactionAction = interactions[customId];
	if (customId.substring(0, 3) === '___') {
		args = customId.substring(3).split('-');
		const interactionType = args.splice(0, 1)[0];
		interactionAction = customInteractions[interactionType];
	}
	if (interactionAction) {
		interactionAction(interaction, ...args);
	}
};
