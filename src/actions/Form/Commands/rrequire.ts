import { isNullishOrEmpty } from '@sapphire/utilities';
import { findRow } from './rlog';
import moment from 'moment';
import getSpreadsheetDocument from '../../../lib/getDoc';
import rencode from '../../../lib/rencode';
import type FormEntry from '../../FormEntry/FormEntry';
import type { EntryAnswer } from '../handleFormCommand';
import { container } from '@sapphire/framework';
import parseChannel from '../../Channel/parseChannel';
import RStudentModel from '../../../schemas/RStudent';
import RStudent from '../../RStudent/RStudent';

const rrequire = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	const [dateEntry, refEntry] = answers.splice(0, 2);
	const dateObj = dateEntry.value && dateEntry.value.length ? moment(parseInt(dateEntry.value![0])) : moment();
	const dateAccomplished = dateObj.utcOffset(8).format('MM/DD/YYYY');
	const referenceNumber = refEntry.value![0].trim();
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
			const requirementsHeader = [...traineeSheet.headerValues];
			requirementsHeader.splice(0, 7);
			const requirements: string[] = [];

			requirementsHeader.forEach((header, i) => {
				if (i < 13 && isNullishOrEmpty(traineeRow[header])) {
					requirements.push(header);
				}
			});

			try {
				const _rstudent = await RStudentModel.findOne({ reference: referenceNumber }).exec();
				const [traineeChannel] = await parseChannel(rencode.guild, rencode.trainee);
				if (traineeChannel?.isText() && _rstudent && _rstudent.locations && _rstudent.locations.trainee) {
					const rstudent = new RStudent(_rstudent);
					const message = await traineeChannel.messages.fetch(_rstudent.locations.trainee.messageId);
					const embedFields = message.embeds[0].fields.map((field) => {
						if (field.name === 'Requirements Needed' || field.name === 'Requirements') {
							field.value = requirements.join(', ');
						}

						return field;
					});

					await message.edit({
						embeds: [message.embeds[0].setFields(embedFields)],
						components: rstudent.createComponents(),
						content: message.content
					});
				}
			} catch (error) {}
			await traineeRow.save();
			container.logger.info(`${entry.form.sheet?.id} ${entry.form.sheet?.index} has been used`);
		}
	}
};

export default rrequire;
