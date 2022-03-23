import type { SelectMenuInteraction } from 'discord.js';
import handleSelectInput from './handleSelectInput';

interface Interactions {
	[name: string]: Function;
}

const customInteractions: Interactions = {
	select: handleSelectInput
};
const interactions: Interactions = {};

export const executeSelect = (interaction: SelectMenuInteraction) => {
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
