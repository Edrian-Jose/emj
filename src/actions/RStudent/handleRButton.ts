import type { ButtonInteraction } from 'discord.js';
import type { RStudentDocument } from '../../schemas/RStudent';
import type { RSubActions } from './RStudent';

const handleRoomButton = async (interaction: ButtonInteraction, type: RSubActions, rId: RStudentDocument['_id']) => {
	console.log(interaction, type, rId);
};

export default handleRoomButton;
