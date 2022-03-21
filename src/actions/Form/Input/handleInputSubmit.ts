import type { QuestionDocument } from './../../../schemas/Question';
import { ButtonInteraction, GuildMember, Message, WebhookEditMessageOptions } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import Prompt from '../Strategies/Prompt';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import webhookEdit from '../../Channel/Webhook/webhookEdit';
import FormEntryModel from '../../../schemas/FormEntry';

const handleInputSubmit = async (interaction: ButtonInteraction | any, questionId: QuestionDocument['_id'], formId: FormEntryDocument['_id']) => {
	const message = interaction.message as Message;
	const { guild, member, channel } = interaction;
	const input: string = interaction.getTextInputValue(`input`);
	const question = await QuestionModel.findById(questionId);
	const _formEntry = await FormEntryModel.getAll(formId);
	await interaction.deferReply({ ephemeral: true });

	if (question && _formEntry) {
		const prompt = new Prompt(formId, question);
		//TODO: perform type checking here
		const embed = message.embeds[0];
		if (input) {
			if (embed.fields[0] && embed.fields[0].name === 'Recorded Input') {
				embed.fields[0].value = input;
			} else {
				embed.addField('Recorded Input', input);
			}

			const index = _formEntry.answers.findIndex((answer) => answer.question._id == questionId);
			if (index >= 0 && _formEntry.answers[index]) {
				_formEntry.answers[index].answer = input;
			} else {
				_formEntry.answers.push({
					question,
					answer: input
				});
			}
		} else {
			if (embed.fields[0] && embed.fields[0].name === 'Recorded Input') {
				embed.fields.splice(0, 1);
			}
			const index = _formEntry.answers.findIndex((answer) => answer.question._id == questionId);
			_formEntry.answers[index] = {
				question
			};
		}
		if (guild && member instanceof GuildMember) {
			let c = channel.isThread() ? channel.parent : channel;
			const options = { embeds: [embed], components: prompt.createComponents(Boolean(input)) } as WebhookEditMessageOptions;
			if (channel.isThread()) {
				options.threadId = channel.id;
			}
			await webhookEdit(c, message, options);
		} else {
			message.edit({ embeds: [embed], components: prompt.createComponents(Boolean(input)) });
		}
		await _formEntry.save();

		return await interaction.followUp({
			content: input ? `Input recorded` : 'Input cleared',
			ephemeral: true
		});
	}

	return await interaction.followUp({
		content: `Error occured. Try again`,
		ephemeral: true
	});
};

export default handleInputSubmit;
