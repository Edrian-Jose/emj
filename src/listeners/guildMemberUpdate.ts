import { getRoleDocument } from './../actions/Role/syncRole';
import { getBadge } from './../actions/Member/assignBadge';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
const getEmojisFromString = require('get-emojis-from-string');
import syncMember from '../actions/Member/syncMember';
import RoleModel from '../schemas/Role';
import refreshBadge from '../actions/Member/refreshBadge';
import parseThread from '../actions/Thread/parseThread';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldMember: GuildMember, newMember: GuildMember) {
		let syncingMember: GuildMember = newMember;
		const oldRoles = Array.from(oldMember.roles.cache.keys());
		const newRoles = Array.from(newMember.roles.cache.keys());
		const rolesAdded = newRoles.filter((roleId) => !oldRoles.includes(roleId));
		const rolesRemoved = oldRoles.filter((roleId) => !newRoles.includes(roleId));
		const forAddition: string[] = [];
		const forRemoval: string[] = [];
		for (const roleAdded of rolesAdded) {
			const _assigningRoles = await RoleModel.find({ and: { $all: [roleAdded] }, roleId: { $not: { $in: newRoles } } }).exec();
			for (const _role of _assigningRoles) {
				if (_role.and) {
					if (_role.and.length === 2 && newRoles.includes(_role.and[0]) && newRoles.includes(_role.and[1])) {
						forAddition.push(_role.roleId);
					}
				}
			}

			const [_role] = await getRoleDocument(newMember.guild, roleAdded);
			if (_role?.thread) {
				const [thread] = await parseThread(newMember.guild, _role.thread.parent, _role.thread.id);
				if (thread) {
					await thread.members.add(newMember.id);
				}
			}
		}

		for (const roleRemoved of rolesRemoved) {
			const _deassigningRoles = await RoleModel.find({ and: { $all: [roleRemoved] } }).exec();
			for (const _role of _deassigningRoles) {
				if (_role.and) {
					if (_role.and.length === 2 && (!newRoles.includes(_role.and[0]) || !newRoles.includes(_role.and[1]))) {
						if (!forRemoval.includes(_role.roleId)) {
							forRemoval.push(_role.roleId);
						}
					}
				}
			}

			const [_role] = await getRoleDocument(newMember.guild, roleRemoved);
			if (_role?.thread) {
				const [thread] = await parseThread(newMember.guild, _role.thread.parent, _role.thread.id);
				if (thread) {
					await thread.members.remove(newMember.id);
				}
			}
		}

		if (forAddition.length) {
			await newMember.roles.add(forAddition);
		} else if (forRemoval.length) {
			await newMember.roles.remove(forRemoval);
		} else {
			const [_member] = await syncMember(oldMember.guild, syncingMember);
			if (newMember.nickname && _member) {
				const badges = getEmojisFromString(newMember.nickname, { onlyDefaultEmojis: true });
				const dbBadge = getBadge(_member);
				const badge = badges.length ? badges[badges.length - 1].name : '';
				if (dbBadge !== badge) {
					await refreshBadge(_member.userId);
				}
			}
		}
	}
}
