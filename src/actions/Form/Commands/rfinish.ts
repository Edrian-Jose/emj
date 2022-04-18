import type FormEntry from '../../FormEntry/FormEntry';
import type { EntryAnswer } from '../handleFormCommand';

const rfinish = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	console.log(answers, entry);
};

export default rfinish;
