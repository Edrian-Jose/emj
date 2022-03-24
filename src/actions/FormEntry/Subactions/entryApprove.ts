import type { ButtonInteraction, Message, TextChannel, ThreadChannel } from 'discord.js';
import approvedApplication from '../../../components/embeds/approvedApplication';
import waitingApproval from '../../../components/embeds/waitingApproval';
import GuildModel from '../../../schemas/Guild';
import parseChannel from '../../Channel/parseChannel';
import utilityWebhookSend from '../../Channel/Webhook/utilityWebhookSend';
import webhookEdit from '../../Channel/Webhook/webhookEdit';
import parseMember from '../../Member/parseMember';
import getPersonalThread from '../../Thread/getPersonalThread';
import type FormEntry from '../FormEntry';
import { removeVerifiers } from './entryDeny';

const entryApprove = async (entry: FormEntry, interaction: ButtonInteraction) => {
	//
	const verifiers = entry.verifiers;

	if (entry.form.resultDestination.type === 'GUILD_CHANNEL' && verifiers) {
		const channel = interaction.channel as ThreadChannel;
		removeVerifiers(channel, verifiers, entry.ownerId);

		const message = interaction.message as Message;

		await webhookEdit((interaction.channel as ThreadChannel).parent!, message, {
			embeds: [approvedApplication(entry, interaction.user.username, false)],
			components: [],
			threadId: interaction.channel?.id
		});
	} else {
		const creator = await interaction.client.users.fetch(entry.form.creatorId);
		const channel = creator.dmChannel ?? (await creator.createDM());
		const message = await channel.messages.fetch(entry.navigatorId!);
		if (message.editable) {
			await message.edit({
				embeds: [approvedApplication(entry, interaction.user.username)],
				components: []
			});
		}
	}

	if (entry.location.type === 'GUILD_TEXT') {
		const [member, guild] = await parseMember(entry.location.guildId!, entry.ownerId);

		const _guild = await GuildModel.findOne({ guildId: guild.id });
		const [deskChannel] = await parseChannel(guild, _guild?.channels.desk!);
		if (deskChannel?.isText()) {
			let [thread] = await getPersonalThread(member, guild, deskChannel as TextChannel);

			if (thread) {
				thread.setArchived(false);
				const message = await thread.messages.fetch(entry.navigatorId);

				if (message) {
					await utilityWebhookSend(
						guild,
						member,
						'desk',
						{
							embeds: [waitingApproval(entry, false, 'Approved')],
							components: entry.createVerifiedComponents()
						},
						`${member.user.username} desk`,
						message
					);
				}
			}
		}
	} else {
		const owner = await interaction.client.users.fetch(entry.ownerId);
		const channel = owner.dmChannel ?? (await owner.createDM());
		const message = await channel.messages.fetch(entry.navigatorId!);
		if (message.editable) {
			await message.edit({
				embeds: [waitingApproval(entry, false, 'Approved')],
				components: entry.createVerifiedComponents()
			});
		}
	}

	entry._document.applicationId = undefined;
	await entry._document.save();
	await interaction.followUp({
		content: `Approved successfully.`,
		ephemeral: true
	});
};

export default entryApprove;
