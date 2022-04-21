import { findRow } from './rlog';
import moment from 'moment';
import getSpreadsheetDocument from '../../../lib/getDoc';
import rencode from '../../../lib/rencode';
import type FormEntry from '../../FormEntry/FormEntry';
import type { EntryAnswer } from '../handleFormCommand';
import { container } from '@sapphire/framework';

const rrequire = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	const [dateEntry, refEntry] = answers.splice(0, 2);
	const dateObj = dateEntry.value && dateEntry.value.length ? moment(parseInt(dateEntry.value![0])) : moment();
	const dateAccomplished = dateObj.utcOffset(8).format('MM/DD/YYYY');
	const referenceNumber = refEntry.value![0];
	const traineeSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.trainee);
	const traineeRow = await findRow(traineeSheet, referenceNumber);

	if (traineeRow) {
		try {
			for (const { question, value } of answers) {
				let postfix = '';
				let currentValues: string[] = [];
				if (question.value === 'OTHERS') {
					traineeRow['OTHERS'] = value && value.length ? value[0] : 'None';
					continue;
				}
				if (value && value.length) {
					try {
						const currentValue = traineeRow[question.value];
						if (currentValue === 'NA') {
							postfix = '*';
						} else if (currentValue) {
							currentValues = (currentValue as string).split(',').map((val) => val.trim());
						}
					} catch (error) {
						console.log(error);
					} finally {
						if (value[0] === 'Need Another' && !postfix) {
							postfix = '~';
						}
						if (!currentValues.includes(dateAccomplished + postfix)) {
							currentValues.push(dateAccomplished + postfix);
						}
						traineeRow[question.value] = currentValues.join(', ');
					}
				}
			}
		} catch (error) {
			console.log(error);
			container.logger.error(`${entry.form.sheet?.id} ${entry.form.sheet?.index} failed write`);
		} finally {
			await traineeRow.save();
			container.logger.info(`${entry.form.sheet?.id} ${entry.form.sheet?.index} has been used`);
		}
	}
};

export default rrequire;
