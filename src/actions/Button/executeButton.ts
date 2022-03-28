import type { ButtonInteraction } from 'discord.js';
import handleFormButton from '../Form/handleFormButton';
import handleInputButton from '../Form/Input/handleInputButton';
import handleOptionButton from '../Form/Option/handleOptionButton';
import handleEntryButton from '../FormEntry/handleEntryButton';

interface Interactions {
	[name: string]: Function;
}

const customInteractions: Interactions = {
	input: handleInputButton,
	option: handleOptionButton,
	form: handleFormButton,
	entry: handleEntryButton
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
