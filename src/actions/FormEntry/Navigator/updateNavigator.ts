import FormEntryModel from './../../../schemas/FormEntry';
import { GuildMember, MessageComponentInteraction, TextChannel, WebhookEditMessageOptions } from 'discord.js';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import FormEntry from '../FormEntry';
import webhookEdit from '../../Channel/Webhook/webhookEdit';
const updateNavigator = async (interaction: MessageComponentInteraction, formId: FormEntryDocument['_id']) => {
	const { guild, member, channel } = interaction;
	const _formEntry = await FormEntryModel.getAll(formId);
	const entry = new FormEntry(_formEntry);
	const options = { embeds: [entry.createQuestionEmbed()], components: entry.createComponents() };

	if (channel) {
		const message = await channel.messages.fetch(_formEntry.navigatorId);
		if (guild && member instanceof GuildMember) {
			let c = channel.isThread() ? channel.parent : channel;
			if (channel.isThread()) {
				(options as WebhookEditMessageOptions).threadId = channel.id;
			}
			await webhookEdit(c as TextChannel, message, options);
		} else if (message) {
			await message.edit(options);
		}
	}
};

export default updateNavigator;
