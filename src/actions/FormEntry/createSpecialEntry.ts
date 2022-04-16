import { container } from '@sapphire/framework';
import type { GuildMember, Message, ThreadChannel } from 'discord.js';
import moment from 'moment';
import approvalForm from '../../components/embeds/approvalForm';
import waitingApproval from '../../components/embeds/waitingApproval';
import FormModel from '../../schemas/Form';
import FormEntryModel from '../../schemas/FormEntry';
import MemberModel from '../../schemas/Member';
import RoleModel from '../../schemas/Role';
import threadWebhookSend from '../Channel/Webhook/threadWebhookSend';
import utilityWebhookSend from '../Channel/Webhook/utilityWebhookSend';
import executeFormCommand from '../Form/handleFormCommand';
import { getGuildDocument } from '../Guild/syncGuild';
import parseMember from '../Member/parseMember';
import parseRole from '../Role/parseRole';
import getPersonalThread from '../Thread/getPersonalThread';
import FormEntry from './FormEntry';

const createSpecialEntry = async (formId: string, ownerId: string, answers: string[]) => {
	//
	const _form = await FormModel.findById(formId).populate('questions').exec();
	if (_form) {
		const guildId = _form.resultDestination.guildId;

		if (guildId) {
			const [_guild, guild] = await getGuildDocument(guildId);
			let [member] = await parseMember(guild, ownerId);
			const verifiers = _form.verifiers;
			const userIds: string[] = [];
			if (verifiers && guild) {
				for (const verifier of verifiers) {
					if (verifier.type == 'ROLE') {
						const _role = await RoleModel.findOne({ roleId: verifier.id, guildId: guild.id });
						const members = await MemberModel.find({ roles: { $all: [_role?._id] }, guildId: guild.id });
						userIds.push(...members.map((member) => member.userId));
					} else {
						userIds.push(verifier.id);
					}
				}
			}

			if (_guild && member) {
				const _entry = await FormEntryModel.create({
					status: 'PENDING',
					ownerId,
					index: _form.questions.length - 1,
					form: _form._id,
					answers: _form.questions.map((question, i) => {
						let label = answers[i] ? answers[i] : 'No response';
						let value = answers[i] ? answers[i] : undefined;
						var formats = ['MM/DD/YYYY', 'M/DD/YYYY'];
						const isDate = moment(answers[i], formats, true).isValid();
						if (isDate) {
							value = moment(answers[i], formats, true).valueOf().toString();
						}

						if (value) {
							return {
								question: question._id,
								answer: [
									{
										label,
										value
									}
								]
							};
						} else {
							return {
								question: question._id
							};
						}
					}),
					location: {
						type: 'GUILD_TEXT',
						guildId: _guild.guildId,
						channelId: _guild.channels.desk
					},
					verifiers: userIds
				});

				const entry = new FormEntry(
					await _entry.populate([
						{
							path: 'answers',
							populate: {
								path: 'question',
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
					])
				);
				if (entry.form.verification) {
					const options = { embeds: [waitingApproval(entry, guild ? false : true)], components: entry.createWaitComponents() };
					const message = (await utilityWebhookSend(guild, member, 'desk', options)) as Message;
					_entry.navigatorId = message.id;

					const [thread] = await getPersonalThread(member, guild, entry.form.resultDestination.id, `${member.user.username} applications`);

					let channel = thread as ThreadChannel;
					channel = await channel.setArchived(false);
					userIds.forEach(async (id) => {
						try {
							const parent = channel.parent;
							const [verifierMember] = await parseMember(guild, id);
							if (verifierMember) {
								const updatedParent = await parent!.permissionOverwrites.create(verifierMember, { VIEW_CHANNEL: true });
								if (updatedParent) {
									await channel.members.add(id);
								}
							}
						} catch (error) {
							console.log(`error occured on ${id}`, error);
						}
					});

					const appMessage = await threadWebhookSend(
						guild,
						member as GuildMember,
						entry.form.resultDestination.id,
						{
							embeds: [approvalForm(entry, entry.form, false)],
							components: entry.createVerificationComponents()
						},
						`${member.user.username} applications`,
						undefined,
						true
					);
					_entry.applicationId = appMessage?.id;
					await _entry.save();
				} else {
					const rewardRoles = entry.form.rewardRoles;

					rewardRoles.forEach(async (roleId) => {
						const _role = await RoleModel.findOne({ roleId }).exec();
						if (_role) {
							const [role, guild] = await parseRole(_role.guildId, _role.roleId);
							try {
								const clientMember = await guild.members.fetch(container.client.user!.id);
								const botRole = clientMember.roles.botRole;
								if (member && role) {
									if (botRole && botRole.position > _role.position) {
										member = await member.roles.add(role);
									}
								}
							} catch (error) {
								console.log(error);
							}
						}
					});
					executeFormCommand(entry, true);
					await entry._document.delete();
				}
			}
		}
	}
};

export default createSpecialEntry;
