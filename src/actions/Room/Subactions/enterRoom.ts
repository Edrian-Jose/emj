import type { ButtonInteraction } from 'discord.js';
import bcrypt from 'bcrypt';
import parseChannel from '../../Channel/parseChannel';
import type Room from '../Room';

const enterRoom = async (room: Room, interaction: ButtonInteraction & any) => {
	await interaction.deferReply({ ephemeral: true });
	const passcode = interaction.getTextInputValue(`passcode`);
	if (passcode && room.password) {
		const similar = await bcrypt.compare(passcode, room.password);
		if (similar) {
			if (room.channelId) {
				const [channel] = await parseChannel(room.guildId, room.channelId);
				if (channel?.isVoice()) {
					await room.updatecontroller(channel);
					await channel.permissionOverwrites.edit(interaction.user, { CONNECT: true, VIEW_CHANNEL: true });
				}
			}
		} else {
			return await interaction.followUp({ content: `Wrong passcode`, ephemeral: true });
		}
	}

	return await interaction.followUp({ content: `You can now join ${room.name}`, ephemeral: true });
};

export default enterRoom;
