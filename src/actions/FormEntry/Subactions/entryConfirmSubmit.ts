import type { ButtonInteraction, GuildMember, ThreadChannel } from 'discord.js';
import approvalForm from '../../../components/embeds/approvalForm';
import waitingApproval from '../../../components/embeds/waitingApproval';
import MemberModel from '../../../schemas/Member';
import RoleModel from '../../../schemas/Role';
import threadWebhookSend from '../../Channel/Webhook/threadWebhookSend';
import parseMember from '../../Member/parseMember';
import getPersonalThread from '../../Thread/getPersonalThread';
import type FormEntry from '../FormEntry';
import updateNavigator from '../Navigator/updateNavigator';
import entryAccept from './entryAccept';

const entryConfirmSubmit = async (entry: FormEntry, interaction: ButtonInteraction) => {
	if (!entry.form.verification) {
		await entryAccept(entry, interaction);
		return;
	}

	const { guild } = interaction;
	const options = { embeds: [waitingApproval(entry, guild ? false : true)], components: entry.createWaitComponents() };

	updateNavigator(interaction, entry._id, options);

	const verifiers = entry.form.verifiers;
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

	if (entry.form.resultDestination.type == 'GUILD_CHANNEL') {
		const [member, guild] = await parseMember(entry.form.resultDestination.guildId!, entry.ownerId);
		if (member) {
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

			const message = await threadWebhookSend(
				guild,
				member as GuildMember,
				entry.form.resultDestination.id,
				{
					embeds: [approvalForm(entry, entry.form, false)],
					components: entry.createVerificationComponents()
				},
				`${member.user.username} applications`
			);
			entry._document.applicationId = message?.id;
		}
	} else {
		const message = await interaction.client.users.send(entry.form.resultDestination.id, {
			embeds: [approvalForm(entry, entry.form, false)],
			components: entry.createVerificationComponents()
		});
		entry._document.applicationId = message?.id;
	}
	entry._document.verifiers = userIds;
	await entry._document.save();
};

export default entryConfirmSubmit;
