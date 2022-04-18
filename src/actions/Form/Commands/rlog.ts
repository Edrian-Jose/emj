import moment from 'moment';
import getSpreadsheetDocument from '../../../lib/getDoc';
import type FormEntry from '../../FormEntry/FormEntry';
import type { EntryAnswer } from '../handleFormCommand';

const rlog = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	if (entry.form.sheet) {
		const sheet = await getSpreadsheetDocument(entry.form.sheet.id, entry.form.sheet.index);

		const dateNow = moment().utcOffset(8).format('MM/DD/YYYY HH:mm A');
		const dateRegistered = moment(parseInt(answers[4].value![0])).utcOffset(8).format('MM/DD/YYYY');
		const birthdate = moment(parseInt(answers[3].value![0])).utcOffset(8).format('MM/DD/YYYY');
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

		const header = sheet.headerValues;
		sheet.addRow(
			{
				[header[0]]: dateNow,
				[header[1]]: dateRegistered,
				[header[2]]: `'${referenceNumber}`,
				[header[3]]: givenName.trim(),
				[header[4]]: mms ? mms.trim() : '-',
				[header[5]]: fsn ? fsn.trim() : '-',
				[header[6]]: hsn ? hsn.trim() : '-',
				[header[7]]: uri,
				[header[8]]: birthdate
			},
			{ raw: true, insert: true }
		);
	}
};

export default rlog;
