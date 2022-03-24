import type { ButtonInteraction, DMChannel, TextChannel } from 'discord.js';
import parseChannel from '../../Channel/parseChannel';
import parseMember from '../../Member/parseMember';
import getPersonalThread from '../../Thread/getPersonalThread';
import type FormEntry from '../FormEntry';
import updateNavigator from '../Navigator/updateNavigator';

const entryEdit = async (entry: FormEntry, interaction: ButtonInteraction) => {
	//
	if (entry.applicationId && entry.form.resultDestination) {
		if (entry.form.resultDestination.type === 'GUILD_CHANNEL') {
			const [member, guild] = await parseMember(entry.form.resultDestination.guildId!, entry.ownerId);
			const [channel] = await parseChannel(guild, entry.form.resultDestination.id);
			const [thread] = await getPersonalThread(member, guild, channel as TextChannel);
			if (thread) {
				thread.setArchived(false);
				await thread.messages.delete(entry.applicationId);
			}
		} else {
			const channel = await interaction.client.channels.fetch(entry.form.resultDestination.id);
			const message = await (channel as DMChannel).messages.fetch(entry.applicationId!);
			if (message.deletable) {
				await message.delete();
			}
		}
		entry._document.applicationId = undefined;
		await entry._document.save();
	}
	updateNavigator(interaction, entry._id);
	await interaction.followUp({
		content: `Application sent for approval has been deleted. You can now edit the form and resend it later.`,
		ephemeral: true
	});
};

export default entryEdit;
