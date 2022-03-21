import type { QuestionDocument } from './../../../schemas/Question';
import { ButtonInteraction, GuildMember, Message, WebhookEditMessageOptions } from 'discord.js';
import QuestionModel from '../../../schemas/Question';
import Prompt from '../Strategies/Prompt';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import webhookEdit from '../../Channel/Webhook/webhookEdit';

const handleInputSubmit = async (interaction: ButtonInteraction | any, questionId: QuestionDocument['_id'], formId: FormEntryDocument['_id']) => {
	const message = interaction.message as Message;
	const { guild, member, channel } = interaction;
	const input: string = interaction.getTextInputValue(`input`);
	const question = await QuestionModel.findById(questionId);

	await interaction.deferReply({ ephemeral: true });

	if (question) {
		const prompt = new Prompt(formId, question);
		//TODO: perform type checking here
		const embed = message.embeds[0];
		if (input) {
			if (embed.fields[0] && embed.fields[0].name === 'Recorded Input') {
				embed.fields[0].value = input;
			} else {
				embed.addField('Recorded Input', input);
			}
		} else {
			if (embed.fields[0] && embed.fields[0].name === 'Recorded Input') {
				embed.fields.splice(0, 1);
			}
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
