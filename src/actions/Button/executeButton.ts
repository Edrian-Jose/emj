import type { ButtonInteraction } from 'discord.js';
import handleInputButton from '../Form/Input/handleInputButton';

interface Interactions {
	[name: string]: Function;
}

const customInteractions: Interactions = {
	input: handleInputButton
};
const interactions: Interactions = {};

export const executeButton = (interaction: ButtonInteraction) => {
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
