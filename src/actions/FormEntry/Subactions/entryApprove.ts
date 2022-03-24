import type { ButtonInteraction } from 'discord.js';
import type FormEntry from '../FormEntry';

const entryApprove = async (entry: FormEntry, interaction: ButtonInteraction) => {
	//
	await interaction.followUp({
		content: `${entry._id}`,
		ephemeral: true
	});
};

export default entryApprove;
