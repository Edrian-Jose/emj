import type FormEntry from '../../FormEntry/FormEntry';
import type { EntryAnswer } from '../handleFormCommand';

const rlog = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	console.log(answers, entry);
};

export default rlog;
