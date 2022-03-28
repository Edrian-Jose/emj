import type { ButtonInteraction } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import temporaryMessage from '../../Message/temporaryMessage';
import type FormEntry from '../FormEntry';
import updateNavigator from '../Navigator/updateNavigator';

const entrySkip = async (entry: FormEntry, interaction: ButtonInteraction) => {
	const question = await QuestionModel.findById(entry.getPrompt()._id);

	if (question) {
		const index = entry._document.answers.findIndex((answer) => {
			return answer.question._id.equals(question._id);
		});

		if (index >= 0 && entry._document.answers[index]) {
			entry._document.answers[index] = {
				question
			};
		} else {
			entry._document.answers.push({
				question
			});
		}
		entry._document.index = entry.index + 1 < entry.questions.length ? entry.index + 1 : entry.index;
		const newEntry = await entry._document.save();
		await updateNavigator(interaction, newEntry._id);
	} else {
		if (interaction.channel) {
			temporaryMessage(interaction.channel, `Question doesn't exist in the database. It will be skipped`);
		}
	}
};

export default entrySkip;
