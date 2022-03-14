import { Duration, TimerManager } from '@sapphire/time-utilities';
import type { Message } from 'discord.js';

const temporaryReply = async (message: Message, messageContent: string, deleteSource = false, duration: Duration = new Duration('5 seconds')) => {
	const reply = await message.reply(messageContent);
	TimerManager.setTimeout(async () => {
		if (reply.deletable) {
			await reply.delete();
		}
		if (deleteSource && message.deletable) {
			await message.delete();
		}
	}, duration.offset);
};

export default temporaryReply;
