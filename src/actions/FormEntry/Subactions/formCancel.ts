import { getGuildDocument } from './../../Guild/syncGuild';
import type { ButtonInteraction, GuildMember } from 'discord.js';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import getPersonalThread from '../../Thread/getPersonalThread';

const formCancel = async (_form: FormEntryDocument, interaction: ButtonInteraction) => {
	const { guild, member, user } = interaction;
	if (guild && member) {
		const [_guild] = await getGuildDocument(guild);
		if (_guild?.channels.admission) {
			let [thread] = await getPersonalThread(member as GuildMember, guild, _guild.channels.admission);
			if (thread) {
				thread = await thread.setArchived(false);
				if (_form.navigatorId) {
					await thread?.messages.delete(_form.navigatorId);
				}
			}
			
			
			
			
		}
	} else {
		const channel = await user.createDM();
		if (channel) {
			await channel.messages.delete(_form.navigatorId);
		}
	}

	await _form.delete();
};

export default formCancel;
