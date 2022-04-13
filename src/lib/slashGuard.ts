import type { CommandInteraction, Message } from 'discord.js';
import temporaryReply from '../actions/Message/temporaryReply';

export class GuardResult {
	public success: boolean;
	public error?: string;
	public constructor(success: boolean, error?: string) {
		this.success = success;
		this.error = error;
	}
}

export interface GuardFunction {
	(source: Message | CommandInteraction): GuardResult | Promise<GuardResult>;
}

const IsAllowed = async (source: CommandInteraction, precondition: GuardFunction) => {
	const result = await precondition(source);
	if (!result.success) {
		await source.reply({ content: result.error, ephemeral: true });
	}
	return result.success;
};

export const IsCommandAllowed = async (source: Message, precondition: GuardFunction) => {
	const result = await precondition(source);
	if (!result.success) {
		await temporaryReply(source, result.error ?? '', true);
	}
	return result.success;
};

export default IsAllowed;
