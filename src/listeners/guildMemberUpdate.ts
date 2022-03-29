import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import syncMember from '../actions/Member/syncMember';
import RoleModel from '../schemas/Role';

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
		}

		if (forAddition.length) {
			await newMember.roles.add(forAddition);
		} else if (forRemoval.length) {
			await newMember.roles.remove(forRemoval);
		} else {
			await syncMember(oldMember.guild, syncingMember);
		}
	}
}
