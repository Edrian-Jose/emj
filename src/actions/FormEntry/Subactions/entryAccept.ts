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
			const clientMember = await guild.members.fetch(interaction.client.user!.id);
			const botRole = clientMember.roles.botRole;
			let [member] = await parseMember(guild, interaction.user);
			if (member && role) {
				if (botRole && botRole.position > _role.position) {
					member = await member.roles.add(role);
				}
			}
		}
	});
	executeFormCommand(entry, true);

	await entry._document.delete();

	if (entry.location.type === 'GUILD_TEXT') {
		let thread = interaction.channel as ThreadChannel;
		if (thread.isThread()) {
			if (entries.length <= 1) {
				await interaction.followUp({
					content: `Thread last archived : ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`,
					ephemeral: true
				});

				await thread.parent?.permissionOverwrites.delete(interaction.user);
				thread = await thread.setArchived(true);
				return;
			}
		}
	}

	await interaction.followUp({
		content: `Application sent for approval has been deleted. You can now edit the form and resend it later.`,
		ephemeral: true
	});
	return;
};

export default entryAccept;
