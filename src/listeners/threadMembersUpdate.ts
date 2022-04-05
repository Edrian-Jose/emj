import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Snowflake } from 'discord-api-types/globals';
import type { Collection, ThreadMember } from 'discord.js';
import { getGuildDocument } from '../actions/Guild/syncGuild';
import parseMember from '../actions/Member/parseMember';
import syncThread from '../actions/Thread/syncThread';
import RoleModel from '../schemas/Role';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldMembers: Collection<Snowflake, ThreadMember>, newMembers: Collection<Snowflake, ThreadMember>) {
		const thread = (oldMembers.first() ?? newMembers.first())?.thread;

		if (thread && thread.guild && thread.parent) {
			const [_guild] = await getGuildDocument(thread.guild);
			if (_guild?.exempted?.threadParent?.includes(thread.parent.id)) {
				return;
			}
		}

		const addedMembers = newMembers.filter((member) => !Array.from(oldMembers.keys()).includes(member.id));
		if (thread && thread.parent) {
			await syncThread(thread.guild, thread.parent, thread, newMembers);
		}

		if (thread) {
			const _roles = await RoleModel.find({ 'thread.id': thread.id }).exec();

			if (_roles.length) {
				for (const [id] of addedMembers) {
					const [member] = await parseMember(thread.guild, id);
					if (member) {
						const cacheRoles = Array.from(member.roles.cache.keys());

						let IsAllowed: boolean = false;
						for (const _role of _roles) {
							IsAllowed = IsAllowed || cacheRoles.includes(_role.roleId);
						}
						if (!IsAllowed) {
							thread.members.remove(id);
						}
					}
				}
			}
			
		}
	}
}
