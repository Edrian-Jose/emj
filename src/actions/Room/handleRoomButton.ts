import type { ButtonInteraction, Message } from 'discord.js';
import type { RoomDocument } from '../../schemas/Room';
import RoomModel from '../../schemas/Room';
import type { RoomSubActions } from './Room';
import Room from './Room';
import editRoom from './Subactions/editRoom';
import enterRoom from './Subactions/enterRoom';
import lockRoom from './Subactions/lockRoom';
import showEditModal from './Subactions/showEditModal';
import showLockModal from './Subactions/showLockModal';
import showPasscodeModal from './Subactions/showPasscodeModal';
import toggleRoomVisibility from './Subactions/toggleRoomVisibility';
import unlockRoom from './Subactions/unlockRoom';

const handleRoomButton = async (interaction: ButtonInteraction, type: RoomSubActions, roomId: RoomDocument['_id']) => {
	const { user } = interaction;

	const _room = await RoomModel.findById(roomId).exec();

	if (_room) {
		const room = new Room(_room);

		if (user.id !== room.host && user.id !== room.cohost && type !== 'lock' && type !== 'enterSubmit') {
			return await interaction.reply({
				content: `Only the host or the cohost can use the interface`,
				ephemeral: true
			});
		}
		switch (type) {
			case 'lock':
				if (room.locked && (user.id === room.host || user.id === room.cohost)) {
					await showPasscodeModal(room, interaction, 'unlockSubmit');
				} else if (room.locked) {
					await showPasscodeModal(room, interaction, 'enterSubmit');
				} else if (user.id === room.host || user.id === room.cohost) {
					await showLockModal(room, interaction);
				} else {
					await interaction.reply({
						content: `Only the host or the cohost can use the interface`,
						ephemeral: true
					});
				}

				break;
			case 'hide':
				await toggleRoomVisibility(room, interaction);
				break;
			case 'edit':
				await showEditModal(room, interaction);
				break;
			case 'thread':
				await interaction.reply({
					content: `Shows a modal that prompts the name of the thread`,
					ephemeral: true
				});
				break;
			case 'event':
				await interaction.reply({
					content: `Shows a modal that prompts the event name, and decription`,
					ephemeral: true
				});
				break;
			case 'lockSubmit':
				await lockRoom(room, interaction);
				break;
			case 'unlockSubmit':
				await unlockRoom(room, interaction);
				break;
			case 'enterSubmit':
				await enterRoom(room, interaction);
				break;
			case 'editSubmit':
				await editRoom(room, interaction);
				break;
			default:
				await interaction.reply({ content: `${room._id}`, ephemeral: true });
				break;
		}
	} else {
		if ((interaction.message as Message).deletable) {
			await (interaction.message as Message).delete();
		}
	}
};

export default handleRoomButton;
