import type { QuestionDocument } from './../../../schemas/Question';
import { ButtonInteraction, GuildMember, Message, WebhookEditMessageOptions } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import webhookEdit from '../../Channel/Webhook/webhookEdit';
import FormEntryModel from '../../../schemas/FormEntry';
import updateNavigator from '../../FormEntry/Navigator/updateNavigator';
import FormEntry from '../../FormEntry/FormEntry';

const handleInputSubmit = async (interaction: ButtonInteraction | any, questionId: QuestionDocument['_id'], formId: FormEntryDocument['_id']) => {
	const message = interaction.message as Message;
	const { guild, member, channel } = interaction;
	const input: string = interaction.getTextInputValue(`input`);
	const question = await QuestionModel.findById(questionId);
	const _formEntry = await FormEntryModel.getAll(formId);
	await interaction.deferReply({ ephemeral: true });

	if (!_formEntry || !_formEntry.form) {
		await message.delete();
		return await interaction.followUp({
			content: ` You can't use the form. Looks like the form is deleted`,
			ephemeral: true
		});
	}
	const entry = new FormEntry(_formEntry);

	if (question && _formEntry) {
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
				_formEntry.answers[index].answer = [{
					label: input,
					value: input
				}];
			} else {
				_formEntry.answers.push({
					question,
					answer: [
						{
							label: input,
							value: input
						}
					]
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
			const options = { embeds: [embed], components: entry.createComponents() } as WebhookEditMessageOptions;
			if (channel.isThread()) {
				options.threadId = channel.id;
			}
			await webhookEdit(c, message, options);
		} else {
			message.edit({ embeds: [embed], components: entry.createComponents() });
		}
		await _formEntry.save();
		await updateNavigator(interaction, formId);
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
