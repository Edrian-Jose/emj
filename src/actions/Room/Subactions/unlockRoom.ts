import type { ButtonInteraction } from 'discord.js';
import Room from '../Room';
import bcrypt from 'bcrypt';
import parseChannel from '../../Channel/parseChannel';

const unlockRoom = async (room: Room, interaction: ButtonInteraction & any) => {
	await interaction.deferReply({ ephemeral: true });
	const passcode = interaction.getTextInputValue(`passcode`);
	if (passcode && room.password) {
		const similar = await bcrypt.compare(passcode, room.password);
		if (similar) {
			room._document.password = undefined;
			room._document.locked = false;
			room._document.hint = undefined;
			const _room = await room._document.save();
			room = new Room(_room);
			if (room.channelId) {
				const [channel] = await parseChannel(room.guildId, room.channelId);
				if (channel?.isVoice()) {
					await room.updatecontroller(channel);
					await channel.permissionOverwrites.edit(room.guildId, { CONNECT: true });
				}
			}
		} else {
			return await interaction.followUp({ content: `Wrong passcode`, ephemeral: true });
		}
	}

	return await interaction.followUp({ content: `${room.name} has been successfully unlocked`, ephemeral: true });
};

export default unlockRoom;
