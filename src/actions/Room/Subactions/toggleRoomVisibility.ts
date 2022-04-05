import type { ButtonInteraction } from 'discord.js';
import Room from '../Room';
import parseChannel from '../../Channel/parseChannel';

const toggleRoomVisibility = async (room: Room, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true });

	room._document.hidden = !room._document.hidden;
	const _room = await room._document.save();
	room = new Room(_room);
	if (room.channelId) {
		const [channel] = await parseChannel(room.guildId, room.channelId);
		if (channel?.isVoice()) {
			await room.updatecontroller(channel);
			await channel.permissionOverwrites.edit(room.guildId, { VIEW_CHANNEL: !room.hidden });
		}
	}
	await interaction.followUp({ content: `${room.name} is now ${room.hidden ? 'hidden' : 'visible'}`, ephemeral: true });
};

export default toggleRoomVisibility;
