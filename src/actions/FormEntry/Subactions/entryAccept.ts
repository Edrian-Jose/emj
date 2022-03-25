import type { ButtonInteraction, ThreadChannel } from 'discord.js';
import FormEntryModel from '../../../schemas/FormEntry';
import RoleModel from '../../../schemas/Role';
import executeFormCommand from '../../Form/handleFormCommand';
import parseMember from '../../Member/parseMember';
import parseRole from '../../Role/parseRole';
import type FormEntry from '../FormEntry';

const entryAccept = async (entry: FormEntry, interaction: ButtonInteraction) => {
	//
	const rewardRoles = entry.form.rewardRoles;
	const entries = await FormEntryModel.find({ ownerId: interaction.user.id }).exec();
	rewardRoles.forEach(async (roleId) => {
		const _role = await RoleModel.findOne({ roleId }).exec();
		if (_role) {
			const [role, guild] = await parseRole(_role.guildId, _role.roleId);
			let [member] = await parseMember(guild, interaction.user);
			if (member && role) {
				member = await member.roles.add(role);
			}
		}
	});
	executeFormCommand(entry, true);
	if (entry.location.type === 'GUILD_TEXT') {
		let thread = interaction.channel as ThreadChannel;
		if (thread.isThread()) {
			if (entries.length <= 1) {
				await thread.parent?.permissionOverwrites.delete(interaction.user);
				thread = await thread.setArchived(true);
			}
		}
	}

	await entry._document.delete();

	await interaction.followUp({
		content: `Application sent for approval has been deleted. You can now edit the form and resend it later.`,
		ephemeral: true
	});
};

export default entryAccept;
