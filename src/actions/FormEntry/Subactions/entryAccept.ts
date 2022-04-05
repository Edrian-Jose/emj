import type { ButtonInteraction, Message, ThreadChannel } from 'discord.js';
import moment from 'moment';
import FormEntryModel from '../../../schemas/FormEntry';
import RoleModel from '../../../schemas/Role';
import executeFormCommand from '../../Form/handleFormCommand';
import parseMember from '../../Member/parseMember';
import parseRole from '../../Role/parseRole';
import type FormEntry from '../FormEntry';

const entryAccept = async (entry: FormEntry, interaction: ButtonInteraction): Promise<void> => {
	//

	const message = interaction.message as Message;
	const rewardRoles = entry.form.rewardRoles;
	const entries = await FormEntryModel.find({ ownerId: interaction.user.id }).exec();

	if (message.deletable) {
		await message.delete();
	}

	rewardRoles.forEach(async (roleId) => {
		const _role = await RoleModel.findOne({ roleId }).exec();
		if (_role) {
			const [role, guild] = await parseRole(_role.guildId, _role.roleId);
			try {
				const clientMember = await guild.members.fetch(interaction.client.user!.id);
				const botRole = clientMember.roles.botRole;
				let [member] = await parseMember(guild, interaction.user);
				if (member && role) {
					if (botRole && botRole.position > _role.position) {
						member = await member.roles.add(role);
					}
				}
			} catch (error) {
				console.log(error);
			}
			
		}
	});
	executeFormCommand(entry, true);

	await entry._document.delete();

	if (entry.form.verification) {
		if (entry.location.type === 'GUILD_TEXT') {
			let thread = interaction.channel as ThreadChannel;
			if (thread.isThread()) {
				if (entries.length <= 1) {
					await interaction.followUp({
						content: `Thread last archived : ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`,
						ephemeral: true
					});
					try {
						await thread.parent?.permissionOverwrites.delete(interaction.user);
					} catch (error) {
						console.log(error);
					}
					
					thread = await thread.setArchived(true);
					return;
				}
			}
		}
	}
	if (rewardRoles && rewardRoles.length) {
		await interaction.followUp({
			content: `Reward role(s) are assigned to you.`,
			ephemeral: true
		});
		return;
	}

	await interaction.followUp({
		content: `Form result accepted`,
		ephemeral: true
	});
	
	return;
};

export default entryAccept;
