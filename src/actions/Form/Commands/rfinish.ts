import { container } from '@sapphire/framework';
import moment from 'moment';
import RStudentModel from '../../../schemas/RStudent';
import type FormEntry from '../../FormEntry/FormEntry';
import RStudent from '../../RStudent/RStudent';
import { endStudent } from '../../RStudent/Subactions/SubmitActions/endSubmit';
import type { EntryAnswer } from '../handleFormCommand';

const rfinish = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	const date = answers[0].value![0];
	const dako = answers[1].value![0];
	const buwan = answers[2].value![0];
	const references = answers[3].value![0].split(',').map((ref) => ref.trim());
	for (const reference of references) {
		const _rstudent = await RStudentModel.findOne({ reference }).exec();
		if (_rstudent) {
			const rstudent = new RStudent(_rstudent);
			await endStudent(rstudent, dako, moment(parseInt(date)).format('MM/DD/YYYY'), buwan);
		}
	}

	container.logger.info(`${entry.form.sheet?.id} ${entry.form.sheet?.index} write successful`);
};

export default rfinish;
