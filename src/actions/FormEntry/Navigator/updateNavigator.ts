import FormEntryModel from './../../../schemas/FormEntry';
import { GuildMember, Message, MessageComponentInteraction, MessageOptions, TextChannel, WebhookEditMessageOptions } from 'discord.js';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import FormEntry from '../FormEntry';
import webhookEdit from '../../Channel/Webhook/webhookEdit';
import utilityWebhookSend from '../../Channel/Webhook/utilityWebhookSend';
const updateNavigator = async (interaction: MessageComponentInteraction, formId: FormEntryDocument['_id'], defaultOptions?: MessageOptions) => {
	const { guild, member, channel } = interaction;
	const _formEntry = await FormEntryModel.getAll(formId);
	const entry = new FormEntry(_formEntry);

	const options = defaultOptions ?? { embeds: [entry.createQuestionEmbed()], components: entry.createComponents() };

	if (channel) {
		if (guild && member instanceof GuildMember) {
			const message = _formEntry.navigatorId
				? await channel.messages.fetch(_formEntry.navigatorId)
				: ((await utilityWebhookSend(guild, member, 'desk', options)) as Message);

			let c = message.channel.isThread() ? message.channel.parent : message.channel;

			if (!_formEntry.navigatorId) {
				_formEntry.navigatorId = message.id;
				_formEntry.location = {
					type: 'GUILD_TEXT',
					channelId: (c as TextChannel).id,
					guildId: guild.id
				};
				await _formEntry.save();
			}

			if (message.channel.isThread()) {
				message.channel.setArchived(false);
				(options as WebhookEditMessageOptions).threadId = message.channel.id;
			}

			await webhookEdit(c as TextChannel, message, options);
		} else {
			const message = await channel.messages.fetch(_formEntry.navigatorId);
			if (message) {
				await message.edit(options);
			}
		}
	}
};

export default updateNavigator;
