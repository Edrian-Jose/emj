import { container } from '@sapphire/framework';
import type { DMChannel } from 'discord.js';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import getPersonalThread from '../../Thread/getPersonalThread';

const entryCancel = async (_entry: FormEntryDocument) => {
	if (_entry.location.type === 'GUILD_TEXT' && _entry.location.guildId && _entry.location.channelId) {
		let [thread] = await getPersonalThread(_entry.ownerId, _entry.location.guildId, _entry.location.channelId);

		if (thread) {
			thread = await thread.setArchived(false);
			if (_entry.navigatorId) {
				await thread?.messages.delete(_entry.navigatorId);
			}
		}
		if (_entry.applicationId) {
			let [appThread] = await getPersonalThread(_entry.ownerId, _entry.location.guildId, _entry.form.resultDestination.id);
			if (appThread) {
				appThread = await appThread.setArchived(false);
				if (_entry.navigatorId) {
					await appThread?.messages.delete(_entry.applicationId);
				}
			}
		}
	} else {
		let channel = (await container.client.channels.fetch(_entry.location.channelId)) as DMChannel;
		if (channel) {
			await channel.messages.delete(_entry.navigatorId);
		}

		if (_entry.applicationId) {
			let channel = (await container.client.channels.fetch(_entry.location.channelId)) as DMChannel;
			if (channel) {
				await channel.messages.delete(_entry.navigatorId);
			}
		}
	}

	await _entry.delete();
};

export default entryCancel;
