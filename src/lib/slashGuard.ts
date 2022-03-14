import type { CommandInteraction, Message } from 'discord.js';

export class GuardResult {
	public success: boolean;
	public error?: string;
	public constructor(success: boolean, error?: string) {
		this.success = success;
		this.error = error;
	}
}

export interface GuardFunction {
	(source: Message | CommandInteraction): GuardResult;
}

const IsAllowed = async (source: CommandInteraction, precondition: GuardFunction) => {
	const result = precondition(source);
	if (!result.success) {
		await source.reply({ content: result.error, ephemeral: true });
	}
	return result.success;
};

export default IsAllowed;
