import { channelMention } from '@discordjs/builders';
import { ButtonInteraction, GuildMember, Message } from 'discord.js';
import type { FormDocument } from '../../../schemas/Form';
import FormEntryModel from '../../../schemas/FormEntry';
import utilityWebhookSend from '../../Channel/Webhook/utilityWebhookSend';
const formCreate = async (_form: FormDocument, interaction: ButtonInteraction) => {
	const { channel, user, guild, member } = interaction;
	if (user && channel) {
		let _formEntry = await FormEntryModel.create({
			ownerId: user.id,
			form: _form._id,
			location: {
				type: channel.type ?? 'DM',
				channelId: channel.id
			}
		});
		if (guild && member instanceof GuildMember) {
			const navigatorMessage = (await utilityWebhookSend(guild, member, 'admission', { content: 'navigator2' })) as Message;
			const questionMessage = (await utilityWebhookSend(guild, member, 'admission', { content: 'navigator2' })) as Message;
			_formEntry.location.guildId = guild.id;
			if (navigatorMessage) {
				_formEntry.navigatorId = navigatorMessage.id;
				await interaction.followUp({
					content: `Form already sent to your admission thread, ${channelMention(navigatorMessage.channelId)}`,
					ephemeral: true
				});
			}
			if (questionMessage) {
				_formEntry.questionId = questionMessage.id;
			}
		} else {
			const navigatorMessage = await user.send({ content: 'navigator' });
			const questionMessage = await user.send({ content: 'question' });
			_formEntry.navigatorId = navigatorMessage.id;
			_formEntry.questionId = questionMessage.id;
			await interaction.followUp({ content: `Form already sent`, ephemeral: true });
		}
		await _formEntry.save();
	} else {
		await interaction.followUp({ content: `Internal problem. Try again or contact the support.`, ephemeral: true });
	}
};

export default formCreate;
