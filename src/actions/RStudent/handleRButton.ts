import type { ButtonInteraction } from 'discord.js';
import type { RStudentDocument } from '../../schemas/RStudent';
import RStudentModel from '../../schemas/RStudent';
import type { RSubActions } from './RStudent';
import RStudent from './RStudent';
import rDelete from './Subactions/rDelete';
import rEnd from './Subactions/rEnd';
import rPause from './Subactions/rPause';
import rTrain from './Subactions/rTrain';
import delSubmit from './Subactions/SubmitActions/delSubmit';

const handleRButton = async (interaction: ButtonInteraction, type: RSubActions, rId: RStudentDocument['_id']) => {
	console.log('boom');

	const _rstudent = await RStudentModel.findById(rId).exec();
	if (!_rstudent) {
		await interaction.reply({
			content: `RStudent cannot found on the database`,
			ephemeral: true
		});
		return;
	}

	const rstudent = new RStudent(_rstudent);
	switch (type) {
		case 'del':
			await rDelete(rstudent, interaction);
			break;
		case 'delSubmit':
			await delSubmit(rstudent, interaction);
			break;
		case 'pause':
			await rPause(rstudent);
			break;
		case 'end':
			await rEnd(rstudent);
			break;
		case 'train':
			await rTrain(rstudent);
			break;
		default:
			console.log('default action triggered', rstudent.reference);
			break;
	}
};

export default handleRButton;
