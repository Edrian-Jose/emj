import { channelMention } from '@discordjs/builders';
import { ButtonInteraction, GuildMember, Message } from 'discord.js';
import type { FormDocument } from '../../../schemas/Form';
import FormEntryModel from '../../../schemas/FormEntry';
import utilityWebhookSend from '../../Channel/Webhook/utilityWebhookSend';
import FormEntry from '../../FormEntry/FormEntry';
import formCancel from '../../FormEntry/Subactions/formCancel';
const formCreate = async (_form: FormDocument, interaction: ButtonInteraction) => {
	const { channel, user, guild, member, channelId } = interaction;

	if (user) {
		let _formEntry = await FormEntryModel.findOne({ ownerId: user.id, form: _form._id });

		if (_formEntry) {
			await formCancel(_formEntry, interaction);
		}

		_formEntry = await FormEntryModel.create({
			ownerId: user.id,
			form: _form._id,
			location: {
				type: channel?.type ?? 'DM',
				channelId: channelId
			},
			index: 0
		});

		_formEntry = await _formEntry.populate(['form', 'answers']);

		const entry = new FormEntry(_formEntry);
		if (_form.type === 'STEP') {
			if (guild && member instanceof GuildMember) {
				const navigatorMessage = (await utilityWebhookSend(guild, member, 'admission', {
					embeds: [entry.createNavigatorEmbed()],
					components: entry.createNavigatorComponents(),
					username: 'Form Navigator'
				})) as Message;
				_formEntry.location.guildId = guild.id;
				if (navigatorMessage) {
					_formEntry.navigatorId = navigatorMessage.id;
					await interaction.followUp({
						content: `Form already sent to your admission thread, ${channelMention(navigatorMessage.channelId)}`,
						ephemeral: true
					});
					const questionMessage = (await utilityWebhookSend(guild, member, 'admission', { content: 'navigator2.1' })) as Message;
					if (questionMessage) {
						_formEntry.questionId = questionMessage.id;
					}
				}
			} else {
				const navigatorMessage = await user.send({ embeds: [entry.createNavigatorEmbed()], components: entry.createNavigatorComponents() });
				const questionMessage = await user.send({ content: 'question' });
				_formEntry.navigatorId = navigatorMessage.id;
				_formEntry.questionId = questionMessage.id;
				await interaction.followUp({ content: `Form already sent`, ephemeral: true });
			}
		} else {
			await interaction.followUp({ content: `SINGLE FORMS NOT IMPLEMENTED YET`, ephemeral: true });
		}

		await _formEntry.save();
	} else {
		await interaction.followUp({ content: `Internal problem. Try again or contact the support.`, ephemeral: true });
	}
};

export default formCreate;
