import { italic } from '@discordjs/builders';
import type { ButtonInteraction } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
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
		await interaction.followUp({
			content: `You skip the question: ${italic(entry.getPrompt().question)}. Undefined input will be recorded`,
			ephemeral: true
		});
	} else {
		await interaction.followUp({
			content: `Question doesn't exist in the database. It will be skipped`,
			ephemeral: true
		});
	}
};

export default entrySkip;
