import { GuardResult } from './../lib/slashGuard';
import { Precondition } from '@sapphire/framework';
import { CommandInteraction, Message, ThreadChannel } from 'discord.js';

export const ThreadOnlyGuard = (source: Message | CommandInteraction) => {
	return source.channel instanceof ThreadChannel
		? new GuardResult(true)
		: new GuardResult(false, 'You can only use this command on thread channels');
};

export class UserPrecondition extends Precondition {
	public run(message: Message | CommandInteraction) {
		const result = ThreadOnlyGuard(message);
		return result.success ? this.ok() : this.error({ message: result.error });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		ThreadOnly: never;
	}
}
