import type { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
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

export const findRow = async (sheet: GoogleSpreadsheetWorksheet, reference: string) => {
	let found = false;
	let index = 0;
	while (!found) {
		if (index > 500) {
			break;
		}
		try {
			const rows = await sheet.getRows({ limit: 10, offset: index });
			for (const row of rows) {
				const rowRef = row['REF NO.'] as string;
				if (rowRef.trim().toLowerCase() === reference.toLowerCase()) {
					return row;
				}
			}
		} catch (error) {
			console.log(error);
			found = true;
		} finally {
			index += 10;
		}
	}
	return null;
};

const rlog = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	if (entry.form.sheet) {
		const logSheet = await getSpreadsheetDocument(entry.form.sheet.id, entry.form.sheet.index);
		const studSheet = await getSpreadsheetDocument(entry.form.sheet.id, 1);

		const dateNow = moment().utcOffset(8).format('MM/DD/YYYY hh:mm A');
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
		const logHeader = logSheet.headerValues;
		const studHeader = studSheet.headerValues;
		logSheet.addRow({
			[logHeader[0]]: dateNow,
			[logHeader[1]]: dateRegistered,
			[logHeader[2]]: `${referenceNumber}`,
			[logHeader[3]]: fullname,
			[logHeader[4]]: uri,
			[logHeader[5]]: birthdate
		});

		studSheet.addRow({
			[studHeader[0]]: dateNow,
			[studHeader[1]]: referenceNumber,
			[studHeader[2]]: capFirstLetter(givenName),
			[studHeader[3]]: lastname,
			[studHeader[4]]: '-',
			[studHeader[5]]: '-'
		});

		let _student = await RStudentModel.create({
			reference: `${referenceNumber}`,
			status: 'student',
			registeredAt: parseInt(answers[3].value![0]
		});
		if (_student) {
			const student = new RStudent(_student);
			_student = await student.register(dateRegisteredObject, referenceNumber, fullname, givenName, lastname, uri, birthdate);
		}
	}
};

export default rlog;
