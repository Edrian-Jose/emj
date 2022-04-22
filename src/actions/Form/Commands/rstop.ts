import { container } from '@sapphire/framework';
import moment from 'moment';
import RStudentModel from '../../../schemas/RStudent';
import type FormEntry from '../../FormEntry/FormEntry';
import RStudent from '../../RStudent/RStudent';
import { pauseStudent } from '../../RStudent/Subactions/SubmitActions/pauseSubmit';
import type { EntryAnswer } from '../handleFormCommand';

const rstop = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	const date = answers[0].value![0];
	const reason = answers[1].value ? answers[1].value[0] : 'Many absences';
	const references = answers[2].value![0].split(',').map((ref) => ref.trim());
	for (const reference of references) {
		const _rstudent = await RStudentModel.findOne({ reference }).exec();
		if (_rstudent) {
			const rstudent = new RStudent(_rstudent);
			await pauseStudent(rstudent, moment(parseInt(date)), reason);
		}
	}

	container.logger.info(`${entry.form.sheet?.id} ${entry.form.sheet?.index} write successful`);
};

export default rstop;
