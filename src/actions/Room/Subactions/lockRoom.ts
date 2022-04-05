import type { ButtonInteraction } from 'discord.js';
import Room from '../Room';
import bcrypt from 'bcrypt';
import parseChannel from '../../Channel/parseChannel';

const lockRoom = async (room: Room, interaction: ButtonInteraction & any) => {
	await interaction.deferReply({ ephemeral: true });
	const passcode = interaction.getTextInputValue(`passcode`);
	const hint = interaction.getTextInputValue(`hint`);
	const hashedPasscode = await bcrypt.hash(passcode, 10);
	room._document.password = hashedPasscode;
	room._document.locked = true;
	room._document.hint = hint ? hint : undefined;
	const _room = await room._document.save();
	room = new Room(_room);
	if (room.channelId) {
		const [channel] = await parseChannel(room.guildId, room.channelId);
		if (channel?.isVoice()) {
			await room.updatecontroller(channel);
			await channel.permissionOverwrites.edit(room.guildId, { CONNECT: false });
		}
	}
	await interaction.followUp({ content: `${room.name} has been successfully locked`, ephemeral: true });
};

export default lockRoom;
