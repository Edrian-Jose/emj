import moment from 'moment';
import getSpreadsheetDocument from '../../../lib/getDoc';
import type FormEntry from '../../FormEntry/FormEntry';
import type { EntryAnswer } from '../handleFormCommand';

const rlog = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	if (entry.form.sheet) {
		const sheet = await getSpreadsheetDocument(entry.form.sheet.id, entry.form.sheet.index);

		const dateNow = moment().utcOffset(8).format('MM/DD/YYYY HH:mm A Z');
		const dateRegistered = moment(parseInt(answers[4].value![0])).format('MM/DD/YYYY HH:mm A Z');
		const birthdate = moment(parseInt(answers[3].value![0])).format('MM/DD/YYYY HH:mm A Z');
		const referenceNumber = answers[0].value![0];
		const [givenName, mms, surname] = answers[1].value![0].split(',');
		const [fsn, hsn] = surname.split('-');
		let uri = answers[2].value![0];
		switch (parseInt(uri)) {
			case 0:
				uri = 'Handog - Nakatala';
				break;
			case 1:
				uri = 'Handog - Di Nakatala';
				break;
			default:
				uri = 'Hindi Handog';
				break;
		}

		sheet.addRow(
			[
				dateNow,
				dateRegistered,
				`'${referenceNumber}`,
				givenName.trim(),
				mms ? mms.trim() : '-',
				fsn ? fsn.trim() : '-',
				hsn ? hsn.trim() : '-',
				uri,
				birthdate
			],
			{ raw: false, insert: true }
		);
	}
};

export default rlog;
