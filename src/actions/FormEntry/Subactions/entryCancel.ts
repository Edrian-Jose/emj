import { container } from '@sapphire/framework';
import type { DMChannel } from 'discord.js';
import type { FormEntryDocument } from '../../../schemas/FormEntry';
import FormEntryModel from '../../../schemas/FormEntry';
import getPersonalThread from '../../Thread/getPersonalThread';
import FormEntry from '../FormEntry';
import { removeVerifiers } from './entryDeny';

const entryCancel = async (_entry: FormEntryDocument) => {
	const entry = new FormEntry(_entry);
	if (_entry.location.type === 'GUILD_TEXT' && _entry.location.guildId && _entry.location.channelId) {
		let [thread] = await getPersonalThread(_entry.ownerId, _entry.location.guildId, _entry.location.channelId);
		const entries = await FormEntryModel.find({ ownerId: _entry.ownerId }).exec();
		if (thread) {
			thread = await thread.setArchived(false);
			if (_entry.navigatorId) {
				await thread?.messages.delete(_entry.navigatorId);
			}

			if (entries.length <= 1) {
				await thread.parent?.permissionOverwrites.delete(_entry.ownerId);
				thread = await thread.setArchived(true);
			}
		}
		if (_entry.applicationId) {
			let [appThread] = await getPersonalThread(_entry.ownerId, _entry.location.guildId, _entry.form.resultDestination.id);

			if (appThread) {
				appThread = await appThread.setArchived(false);
				await appThread?.messages.delete(_entry.applicationId);

				if (entry.verifiers) {
					removeVerifiers(appThread, entry.verifiers, entry.ownerId);
				}
			}
		}
	} else if (_entry.location.channelId) {
		try {
			let channel = (await container.client.channels.fetch(_entry.location.channelId)) as DMChannel;
			if (channel) {
				await channel.messages.delete(_entry.navigatorId);
			}
		} catch (error) {
			console.log(error);
		}
	}

	await _entry.delete();
};

export default entryCancel;
