import { GuardResult } from './../lib/slashGuard';
import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, GuildMember, Message } from 'discord.js';
import { getGuildDocument } from '../actions/Guild/syncGuild';

export const ModeratorOnlyGuard = async (source: Message | CommandInteraction) => {
	if (!source.guild) {
		return new GuardResult(false, 'You can only use this command in servers');
	}

	const [_guild] = await getGuildDocument(source.guild!);
	if (_guild) {
		return Array.from((source.member as GuildMember)?.roles.cache.keys()).includes(_guild.roles.moderator)
			? new GuardResult(true)
			: new GuardResult(false, 'Only a MODERATOR can use this command!');
	}

	return new GuardResult(false, 'Only a MODERATOR can use this command!');
};

export class UserPrecondition extends Precondition {
	public async run(message: Message | CommandInteraction) {
		const result = await ModeratorOnlyGuard(message);
		return result.success ? this.ok() : this.error({ message: result.error });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		ModeratorOnly: never;
	}
}
