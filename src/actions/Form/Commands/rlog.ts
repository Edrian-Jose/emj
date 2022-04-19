import moment from 'moment';
import getSpreadsheetDocument from '../../../lib/getDoc';
import RStudentModel from '../../../schemas/RStudent';
import type FormEntry from '../../FormEntry/FormEntry';
import RStudent from '../../RStudent/RStudent';
import type { EntryAnswer } from '../handleFormCommand';

export const capFirstLetter = (text: string) => {
	var splitStr = text.trim().toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	// Directly return the joined string
	return splitStr.join(' ');
};

const rlog = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	if (entry.form.sheet) {
		const logSheet = await getSpreadsheetDocument(entry.form.sheet.id, entry.form.sheet.index);
		const studSheet = await getSpreadsheetDocument(entry.form.sheet.id, 1);

		const dateNow = moment().utcOffset(8).format('MM/DD/YYYY HH:mm A');
		const dateRegisteredObject = moment(parseInt(answers[4].value![0])).utcOffset(8);
		const dateRegistered = dateRegisteredObject.format('MM/DD/YYYY');
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
		const lastname = hsn ? capFirstLetter(hsn) : fsn ? capFirstLetter(fsn) : capFirstLetter(mms);
		const fullname = [
			capFirstLetter(givenName),
			mms ? capFirstLetter(mms) : undefined,
			hsn ? (fsn ? `${capFirstLetter(fsn)} - ${capFirstLetter(hsn)}` : `- ${capFirstLetter(hsn)}`) : fsn ? capFirstLetter(fsn) : undefined
		].join(' ');

		logSheet.addRow([dateNow, dateRegistered, `${referenceNumber}`, fullname, uri, birthdate]);
		studSheet.addRow([dateNow, referenceNumber, givenName, lastname, '-', '-']);
		let _student = await RStudentModel.create({
			reference: `${referenceNumber}`
		});
		if (_student) {
			const student = new RStudent(_student);
			_student = await student.register(dateRegisteredObject, referenceNumber, fullname, givenName, lastname, uri, birthdate);
		}
	}
};

export default rlog;
