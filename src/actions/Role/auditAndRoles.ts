import { container } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import type { RoleDocument } from '../../schemas/Role';
import RoleModel from '../../schemas/Role';
import parseMember from '../Member/parseMember';

const auditANDRoles = async () => {
	let _roles: (RoleDocument & { _id: any })[] = [];
	let guild: Guild | null = null;
	try {
		_roles = await RoleModel.find({ and: { $size: 2 } });
		_roles.push(...(await RoleModel.find({ and: { $size: 3 } })));
	} catch (error) {
		console.log(error);
	} finally {
		for (const _role of _roles) {
			const membersId = _role.members;
			for (const id of membersId) {
				const [member, parsedGuild] = await parseMember(guild ? guild : _role.guildId, id);
				guild = parsedGuild;
				if (member) {
					let isValid = true;
					const roles = Array.from(member.roles.cache.keys());
					if (_role.and) {
						for (const roleId of _role.and) {
							isValid = isValid && roles.includes(roleId);
						}
					}

					if (!isValid) {
						await member.roles.remove(_role.roleId);
					}
				}
			}
		}
		container.logger.info('Audited and roles');
	}
};

export default auditANDRoles;
