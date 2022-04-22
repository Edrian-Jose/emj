import { container } from '@sapphire/framework';
import moment from 'moment';
import RStudentModel from '../../../schemas/RStudent';
import type FormEntry from '../../FormEntry/FormEntry';
import RStudent from '../../RStudent/RStudent';
import { trainStudent } from '../../RStudent/Subactions/SubmitActions/trainSubmit';
import type { EntryAnswer } from '../handleFormCommand';

const rtrain = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	const date = answers[0].value![0];
	const references = answers[1].value![0].split(',').map((ref) => ref.trim());
	for (const reference of references) {
		const _rstudent = await RStudentModel.findOne({ reference }).exec();
		if (_rstudent) {
			const rstudent = new RStudent(_rstudent);
			await trainStudent(rstudent, moment(parseInt(date)));
		}
	}
	container.logger.info(`${entry.form.sheet?.id} ${entry.form.sheet?.index} write successful`);
};

export default rtrain;
