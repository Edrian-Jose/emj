import { GuardResult } from './../lib/slashGuard';
import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';

export const MeOnly = (source: Message | CommandInteraction) => {
	//replace ` source.type === 'DEFAULT' ` with your condition
	return source.type === 'DEFAULT'
		? new GuardResult(true)
		: new GuardResult(false, "Interaction commands are not allowed");
};

export class UserPrecondition extends Precondition {
	public run(message: Message | CommandInteraction) {
		const result = MeOnly(message);
		return result.success ? this.ok() : this.error({ message: result.error });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		MeOnly: never;
	}
}
