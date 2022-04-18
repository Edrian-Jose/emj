import type FormEntry from '../../FormEntry/FormEntry';
import type { EntryAnswer } from '../handleFormCommand';

const rtrain = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	console.log(answers, entry);
};

export default rtrain;
