import { channelMention } from '@discordjs/builders';
import { ButtonInteraction, GuildMember, Message, ThreadChannel } from 'discord.js';
import type { FormDocument } from '../../../schemas/Form';
import FormEntryModel from '../../../schemas/FormEntry';
import MemberModel from '../../../schemas/Member';
import utilityWebhookSend from '../../Channel/Webhook/utilityWebhookSend';
import FormEntry from '../../FormEntry/FormEntry';
import entryCancel from '../../FormEntry/Subactions/entryCancel';
const formCreate = async (_form: FormDocument, interaction: ButtonInteraction) => {
	const { user, guild, member } = interaction;

	if (user) {
		if (member && guild && _form.requiredRoles) {
			const _member = await MemberModel.getAll(user.id, guild.id);
			let hasAll = false;
			_form.requiredRoles.forEach((roleId) => {
				const role = _member?.roles?.find((role) => role.roleId == roleId);
				if (role) {
					hasAll = hasAll && true;
				} else {
					hasAll = hasAll && false;
				}
			});
			if (!hasAll) {
				await interaction.followUp({
					content: `You didn't have the required roles necessary to fill out this form`,
					ephemeral: true
				});
				return;
			}
		}
		let _formEntry = await FormEntryModel.findOne({ ownerId: user.id, form: _form._id });

		if (_formEntry) {
			await entryCancel(_formEntry);
		}

		_formEntry = await FormEntryModel.create({
			ownerId: user.id,
			form: _form._id,
			index: 0
		});

		_formEntry = await _formEntry.populate([
			{
				path: 'answers',
				populate: {
					path: 'questions',
					model: 'Question'
				}
			},
			{
				path: 'form',
				populate: {
					path: 'questions',
					model: 'Question'
				}
			}
		]);

		const entry = new FormEntry(_formEntry);
		if (_form.type === 'STEP') {
			if (guild && member instanceof GuildMember) {
				const navigatorMessage = (await utilityWebhookSend(guild, member, 'admission', {
					embeds: [entry.createQuestionEmbed()],
					components: entry.createComponents(),
					username: `${entry.form.title}`
				})) as Message;

				if (navigatorMessage) {
					if (navigatorMessage.guildId && (navigatorMessage.channel as ThreadChannel).parent) {
						_formEntry.location = {
							type: 'GUILD_TEXT',
							guildId: navigatorMessage.guildId,
							channelId: (navigatorMessage.channel as ThreadChannel)!.parent!.id
						};
					}
					_formEntry.navigatorId = navigatorMessage.id;
					await interaction.followUp({
						content: `Form already sent to your admission thread, ${channelMention(navigatorMessage.channelId)}`,
						ephemeral: true
					});
				}
			} else {
				const navigatorMessage = await user.send({ embeds: [entry.questions[0].createEmbed()], components: entry.createComponents() });
				_formEntry.location = {
					type: 'DM',
					channelId: navigatorMessage.channelId
				};
				_formEntry.navigatorId = navigatorMessage.id;
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
