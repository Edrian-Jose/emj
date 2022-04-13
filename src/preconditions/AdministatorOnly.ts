import { GuardResult } from './../lib/slashGuard';
import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, GuildMember, Message } from 'discord.js';

export const AdministatorOnlyGuard = (source: Message | CommandInteraction) => {
	return (source.member as GuildMember)?.permissions.has('ADMINISTRATOR')
		? new GuardResult(true)
		: new GuardResult(false, 'Only an ADMINISTRATOR can use this command!');
};

export class UserPrecondition extends Precondition {
	public run(message: Message | CommandInteraction) {
		const result = AdministatorOnlyGuard(message);
		return result.success ? this.ok() : this.error({ message: result.error });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		AdministatorOnly: never;
	}
}
