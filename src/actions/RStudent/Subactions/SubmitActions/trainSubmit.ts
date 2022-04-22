import type { ButtonInteraction } from 'discord.js';
import moment, { Moment } from 'moment';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import rencode from '../../../../lib/rencode';
import parseChannel from '../../../Channel/parseChannel';
import { findRow } from '../../../Form/Commands/rlog';
import type RStudent from '../../RStudent';

export const getRequirementsArray = async (rstudent: RStudent, row: Object): Promise<[string[], Object]> => {
	const infoSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.information);
	const infoRow = await findRow(infoSheet, rstudent.reference);
	const requirements = ['SALAYSAY NG SBOK', 'PATOTOO NG KATIWALA', 'PATOTOO NG KAPISANAN', 'ID PICTURE', 'BIRTH CERTIFICATE'];
	if (infoRow) {
		const birthdate = infoRow['BIRTHDATE'];
		const birthdateObj = moment(birthdate, ['MM/DD/YYYY'], true).utcOffset(8);
		const age = moment().diff(birthdateObj, 'years');
		const isSingle =
			infoRow['KALAGAYANG SIBIL'] === 'Binata' ||
			infoRow['KALAGAYANG SIBIL'] === 'Dalaga' ||
			infoRow['KALAGAYANG SIBIL'] === 'Balo' ||
			infoRow['KALAGAYANG SIBIL'] === 'Annulled';
		if (infoRow['URI'] !== 'Hindi Handog' || age >= 18) {
			row['PARENT CONSENT'] = 'NA';
		} else {
			requirements.push('PARENT CONSENT');
		}
		if (age >= 23 || age < 18 || !isSingle) {
			row['SALAYSAY NA WALANG KINAKASAMA'] = 'NA';
		} else {
			requirements.push('SALAYSAY NA WALANG KINAKASAMA');
		}
		if (!isSingle || age < 24) {
			row['CENOMAR'] = 'NA';
		} else {
			requirements.push('CENOMAR');
		}
		if (isSingle) {
			row['COM'] = 'NA';
		} else {
			requirements.push('COM');
		}
		if (infoRow['KALAGAYANG SIBIL'] !== 'Balo') {
			row['DEATH CERTIFICATE'] = 'NA';
		} else {
			requirements.push('DEATH CERTIFICATE');
		}
		if (infoRow['RELIHIYON NG ASAWA'] !== 'INC (tiwalag)') {
			row['R2-10'] = 'NA';
		} else {
			requirements.push('R2-08/R2-10/R6-01');
		}
		if (infoRow['RELIHIYON NG ASAWA'] !== 'INC') {
			row['PETSA NG BAUTISMO NG ASAWA'] = 'NA';
		} else {
			requirements.push('PETSA NG BAUTISMO NG ASAWA');
		}
	}

	return [requirements, row];
};

export const trainStudent = async (rstudent: RStudent, dateObj: Moment) => {
	try {
		const studentSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.student);
		const traineeSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.trainee);
		const logSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.log);

		const studentRow = await findRow(studentSheet, rstudent.reference);
		const logRow = await findRow(logSheet, rstudent.reference);

		if (rstudent.locations && studentRow && logRow) {
			const traineeHeader = traineeSheet.headerValues;
			let row = {
				[traineeHeader[0]]: moment().utcOffset(8).format('MM/DD/YYYY hh:mm A'),
				[traineeHeader[1]]: dateObj.utcOffset(8).format('MM/DD/YYYY'),
				[traineeHeader[2]]: rstudent.reference,
				[traineeHeader[3]]: studentRow['UNANG PANGALAN'],
				[traineeHeader[4]]: studentRow['APELYIDO'],
				[traineeHeader[5]]: studentRow['DAKO NG GAWAIN']
			};

			if (rstudent.locations.student) {
				const [studChannel] = await parseChannel(rstudent.locations.student.guildId, rstudent.locations.student.channelId);
				if (studChannel?.isText()) {
					await studChannel.messages.delete(rstudent.locations.student.messageId);
				}
				const data = await getRequirementsArray(rstudent, row);
				const requirements = data[0];
				row = data[1];

				const trainMessage = await rstudent.train(
					dateObj,
					rstudent.reference,
					logRow['BUONG PANGALAN'],
					studentRow['UNANG PANGALAN'],
					studentRow['APELYIDO'],
					requirements.join(', ')
				);

				if (rstudent._document.locations && trainMessage) {
					rstudent._document.locations.trainee = {
						guildId: rstudent.locations.student.guildId,
						channelId: rencode.trainee,
						messageId: trainMessage.id
					};

					rstudent._document.locations.student = undefined;
					rstudent._document.status = 'trainee';
					await rstudent._document.save();
				}
			}

			await traineeSheet.addRow(row);
			await studentRow.delete();
		}
	} catch (error) {
		console.log(error);
	}
};

const trainSubmit = async (rstudent: RStudent, interaction: ButtonInteraction | any) => {
	//
	await interaction.deferReply({ ephemeral: true });

	try {
		const date: string | undefined = interaction.getTextInputValue(`date`);
		const dateObj = moment(date, ['MM/DD/YYYY'], true);
		if (!dateObj.isValid()) {
			await interaction.followUp({ content: `Invalid date format`, ephemeral: true });
		}

		await trainStudent(rstudent, dateObj);
	} catch (error) {
		console.log(error);
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} transferring to trainee failed` });
	} finally {
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} successfully transferred to trainee` });
	}
};

export default trainSubmit;
