import { GuardResult } from './../lib/slashGuard';
import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, GuildMember, Message } from 'discord.js';

export const ModeratorOnlyGuard = (source: Message | CommandInteraction) => {
	return (source.member as GuildMember)?.permissions.has('MUTE_MEMBERS')
		? new GuardResult(true)
		: new GuardResult(false, 'Only a MODERATOR can use this command!');
};

export class UserPrecondition extends Precondition {
	public run(message: Message | CommandInteraction) {
		const result = ModeratorOnlyGuard(message);
		return result.success ? this.ok() : this.error({ message: result.error });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		ModeratorOnly: never;
	}
}
