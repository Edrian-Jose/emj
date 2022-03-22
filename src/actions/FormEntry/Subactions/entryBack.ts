import type { ButtonInteraction } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import temporaryMessage from '../../Message/temporaryMessage';
import type FormEntry from '../FormEntry';
import updateNavigator from '../Navigator/updateNavigator';

const entryBack = async (entry: FormEntry, interaction: ButtonInteraction) => {
	const question = await QuestionModel.findById(entry.getPrompt()._id);

	if (question) {
		entry._document.index = entry.index + 1 < entry.questions.length ? entry.index + 1 : entry.index;
		const newEntry = await entry._document.save();
		await updateNavigator(interaction, newEntry._id);
	} else {
		if (interaction.channel) {
			temporaryMessage(interaction.channel, `Question doesn't exist in the database. It will be skipped`);
		}
	}
};

export default entryBack;
