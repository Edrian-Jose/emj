import type { ButtonInteraction } from 'discord.js';
import type { RStudentDocument } from '../../schemas/RStudent';
import RStudentModel from '../../schemas/RStudent';
import type { RSubActions } from './RStudent';
import RStudent from './RStudent';
import rBack from './Subactions/rBack';
import rDelete from './Subactions/rDelete';
import rEnd from './Subactions/rEnd';
import rPause from './Subactions/rPause';
import rTrain from './Subactions/rTrain';
import backSubmit from './Subactions/SubmitActions/backSubmit';
import delSubmit from './Subactions/SubmitActions/delSubmit';
import pauseSubmit from './Subactions/SubmitActions/pauseSubmit';
import trainSubmit from './Subactions/SubmitActions/trainSubmit';

const handleRButton = async (interaction: ButtonInteraction, type: RSubActions, rId: RStudentDocument['_id']) => {
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
			await rPause(rstudent, interaction);
			break;
		case 'pauseSubmit':
			await pauseSubmit(rstudent, interaction);
			break;
		case 'back':
			await rBack(rstudent, interaction);
			break;
		case 'backSubmit':
			await backSubmit(rstudent, interaction);
			break;
		case 'end':
			await rEnd(rstudent);
			break;
		case 'train':
			await rTrain(rstudent, interaction);
			break;
		case 'trainSubmit':
			await trainSubmit(rstudent, interaction);
			break;

		default:
			console.log('default action triggered', rstudent.reference);
			break;
	}
};

export default handleRButton;
