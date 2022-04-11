import { roleMention } from '@discordjs/builders';
import { GuildMember, SelectMenuInteraction } from 'discord.js';
import { getGuildDocument } from '../Guild/syncGuild';
import parseRole from '../Role/parseRole';

// handleSelectColor;
const handleSelectColor = async (interaction: SelectMenuInteraction) => {
	//
	const { guild, member } = interaction;
	await interaction.deferReply({ ephemeral: true });
	if (!guild || !member || !(member instanceof GuildMember)) {
		await interaction.followUp(`This select menu is only allowed inside a server`);
		return;
	}
	const colorRoleId = interaction.values[0];

	const [role] = await parseRole(guild, colorRoleId);
	const [_guild] = await getGuildDocument(guild);
	if (role && _guild) {
		try {
			await member.roles.remove(_guild.colorRoles ?? []);
		} catch (error) {
			console.log(error);
		} finally {
			await member.roles.add(role);
			await interaction.followUp(`Color role ${roleMention(role.id)} has been set to you`);
		}
	}
};

export default handleSelectColor;
