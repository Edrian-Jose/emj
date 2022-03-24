import { container } from '@sapphire/framework';
import type { DMChannel } from 'discord.js';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import getPersonalThread from '../../Thread/getPersonalThread';

const entryCancel = async (_form: FormEntryDocument) => {
	if (_form.location.type === 'GUILD_TEXT' && _form.location.guildId && _form.location.channelId) {
		let [thread] = await getPersonalThread(_form.ownerId, _form.location.guildId, _form.location.channelId);

		if (thread) {
			thread = await thread.setArchived(false);
			if (_form.navigatorId) {
				await thread?.messages.delete(_form.navigatorId);
			}
		}
		if (_form.applicationId) {
			let [appThread] = await getPersonalThread(_form.ownerId, _form.location.guildId, _form.form.resultDestination.id);
			if (appThread) {
				appThread = await appThread.setArchived(false);
				if (_form.navigatorId) {
					await appThread?.messages.delete(_form.applicationId);
				}
			}
		}
	} else {
		let channel = (await container.client.channels.fetch(_form.location.channelId)) as DMChannel;
		if (channel) {
			await channel.messages.delete(_form.navigatorId);
		}

		if (_form.applicationId) {
			let channel = (await container.client.channels.fetch(_form.location.channelId)) as DMChannel;
			if (channel) {
				await channel.messages.delete(_form.navigatorId);
			}
		}
	}

	await _form.delete();
};

export default entryCancel;
