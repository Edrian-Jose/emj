import type { ButtonInteraction, GuildMember, Message, ThreadChannel } from 'discord.js';
import waitingApproval from '../../../components/embeds/waitingApproval';
import MemberModel from '../../../schemas/Member';
import RoleModel from '../../../schemas/Role';
import threadWebhookSend from '../../Channel/Webhook/threadWebhookSend';
import parseMember from '../../Member/parseMember';
import type FormEntry from '../FormEntry';
import updateNavigator from '../Navigator/updateNavigator';

const entryConfirmSubmit = async (entry: FormEntry, interaction: ButtonInteraction) => {
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

		const message = await threadWebhookSend(
			guild,
			member as GuildMember,
			entry.form.resultDestination.id,
			{
				content: `Test lang`
			},
			`${member.user.username} applications`
		);
		entry._document.applicationId = message?.id;
		const channel = (message as Message).channel as ThreadChannel;
		userIds.forEach(async (id) => {
			try {
				const parent = channel.parent;
				const [verifierMember] = await parseMember(guild, id);
				const updatedParent = await parent!.permissionOverwrites.create(verifierMember, { VIEW_CHANNEL: true });
				if (updatedParent) {
					await channel.members.add(id);
				}
			} catch (error) {
				console.log(`error occured on ${id}`, error);
			}
		});
	} else {
		const message = await interaction.client.users.send(entry.form.creatorId, {
			content: `Test dm lang`
		});
		entry._document.applicationId = message?.id;
	}
	entry._document.verifiers = userIds;
	await entry._document.save();
};

export default entryConfirmSubmit;
