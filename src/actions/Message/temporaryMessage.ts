import { Duration, TimerManager } from '@sapphire/time-utilities';
import type { TextBasedChannel } from 'discord.js';

const temporaryMessage = async (channel: TextBasedChannel, messageContent: string, duration: Duration = new Duration('5 seconds')) => {
	const message = await channel.send(messageContent);
	TimerManager.setTimeout(async () => {
		if (message.deletable) {
			await message.delete();
		}
	}, duration.offset);
};

export default temporaryMessage;
