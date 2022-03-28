import { channelMention } from '@discordjs/builders';
import { ButtonInteraction, GuildMember, Message, ThreadChannel, User } from 'discord.js';
import type { FormDocument } from '../../../schemas/Form';
import FormEntryModel, { FormEntryDocument } from '../../../schemas/FormEntry';
import MemberModel from '../../../schemas/Member';
import utilityWebhookSend from '../../Channel/Webhook/utilityWebhookSend';
import FormEntry from '../../FormEntry/FormEntry';
import entryCancel from '../../FormEntry/Subactions/entryCancel';
const { showModal } = require('discord-modals');

export const formInstantiate = async (user: User, _form: FormDocument, answers?: FormEntryDocument['answers']) => {
	let _formEntry = await FormEntryModel.findOne({ ownerId: user.id, form: _form._id });
	if (_formEntry) {
		await entryCancel(_formEntry);
	}

	_formEntry = await FormEntryModel.create({
		ownerId: user.id,
		form: _form._id,
		index: 0,
		answers: answers
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

	return _formEntry;
};

const formCreate = async (_form: FormDocument, interaction: ButtonInteraction) => {
	const { user, guild, member } = interaction;

	if (user) {
		if (member && guild && _form.requiredRoles) {
			const _member = await MemberModel.getAll(user.id, guild.id);
			let hasAll = true;
			_form.requiredRoles.forEach((roleId) => {
				const role = _member?.roles?.find((role) => {
					return role.roleId == roleId;
				});
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

		if (_form.type === 'STEP') {
			const _formEntry = await formInstantiate(user, _form);
			const entry = new FormEntry(_formEntry);
			await interaction.deferReply({
				ephemeral: true
			});
			if (guild && member instanceof GuildMember) {
				const navigatorMessage = (await utilityWebhookSend(guild, member, 'desk', {
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
						content: `Form already sent to your desk, ${channelMention(navigatorMessage.channelId)}`,
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
				await _formEntry.save();
			}
		} else {
			showModal(FormEntry.createStepModal(_form), {
				client: interaction.client,
				interaction
			});
		}
	} else {
		await interaction.followUp({ content: `Internal problem. Try again or contact the support.`, ephemeral: true });
	}
};

export default formCreate;
