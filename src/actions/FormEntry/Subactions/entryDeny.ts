import type { ButtonInteraction, Message, Snowflake, TextChannel, ThreadChannel } from 'discord.js';
import waitingApproval from '../../../components/embeds/waitingApproval';
import FormEntryModel from '../../../schemas/FormEntry';
import GuildModel from '../../../schemas/Guild';
import parseChannel from '../../Channel/parseChannel';
import utilityWebhookSend from '../../Channel/Webhook/utilityWebhookSend';
import parseMember from '../../Member/parseMember';
import getPersonalThread from '../../Thread/getPersonalThread';
import type FormEntry from '../FormEntry';

export const removeVerifiers = (channel: ThreadChannel, verifiers: string[], ownerId: Snowflake) => {
	verifiers.forEach(async (id) => {
		const ownerEntries = await FormEntryModel.find({ verifiers: { $all: [id] }, ownerId }).exec();
		if (ownerEntries.length <= 1) {
			await channel.members.remove(id);
		}
		const entries = await FormEntryModel.find({ verifiers: { $all: [id] } }).exec();
		if (entries.length <= 1) {
			await channel.parent?.permissionOverwrites.delete(id);
		}
	});
};

const entryDeny = async (entry: FormEntry, interaction: ButtonInteraction | any) => {
	//
	await interaction.deferReply({ ephemeral: true });

	const reason: string | undefined = interaction.getTextInputValue(`reason`);
	const recommendation: string | undefined = interaction.getTextInputValue(`recommendation`);
	const verifiers = entry.verifiers;
	if (entry.form.resultDestination.type == 'GUILD_CHANNEL' && verifiers) {
		const channel = interaction.channel as ThreadChannel;
		const [member, guild] = await parseMember(entry.form.resultDestination.guildId!, entry.ownerId);
		removeVerifiers(channel, verifiers, entry.ownerId);

		const _guild = await GuildModel.findOne({ guildId: guild.id });
		const [deskChannel] = await parseChannel(guild, _guild?.channels.desk!);
		if (channel?.isText()) {
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
							embeds: [waitingApproval(entry, false, 'Denied', reason, recommendation)]
						},
						`${member.user.username} desk`,
						message
					);
				}
			}
		}
	} else {
		const owner = await interaction.client.fetch(entry.ownerId);
		const channel = owner.dmChannel ?? (await owner.createDM());
		const message = await channel.messages.fetch(entry.navigatorId!);
		if (message.editable) {
			await message.edit({
				embeds: [waitingApproval(entry, false, 'Denied', reason, recommendation)]
			});
		}
	}

	if ((interaction.message as Message).deletable) {
		await (interaction.message as Message).delete();
	}

	entry._document.applicationId = undefined;
	await entry._document.save();
	await interaction.followUp({
		content: `Denied successfully.`,
		ephemeral: true
	});
};

export default entryDeny;
