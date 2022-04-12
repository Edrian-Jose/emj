import moment from 'moment';
import getSpreadsheetDocument from '../../../lib/getDoc';
import type FormEntry from '../../FormEntry/FormEntry';
import type { EntryAnswer, FormCommand } from '../handleFormCommand';

const saveToSheet: FormCommand = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	if (entry.form.sheet) {
		const emailValues = answers.filter((answer) => answer.question.customId === 'contactEmailA0')[0].value;
		const email = emailValues ? emailValues[0] : 'None';
		const sheet = await getSpreadsheetDocument(entry.form.sheet.id, entry.form.sheet.index);
		await sheet.addRow([moment().valueOf(), email, entry.ownerId, ...answers.map((answer) => (answer.value ? answer.value[0] : ''))]);
	}
};

export default saveToSheet;
