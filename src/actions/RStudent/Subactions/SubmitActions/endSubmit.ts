import { findRow } from './../../../Form/Commands/rlog';
import type { ButtonInteraction } from 'discord.js';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import rencode from '../../../../lib/rencode';
import type RStudent from '../../RStudent';
import moment from 'moment';
import { delStudent } from './delSubmit';

export const endStudent = async (rstudent: RStudent, dako: string, petsa: string, buwan: string) => {
	console.log(rstudent.reference, dako, petsa, buwan);
	const { reference } = rstudent;
	const endSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.finished);
	const logSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.log);
	const infoSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.information);
	const traineeSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.trainee);

	const logRow = await findRow(logSheet, reference);
	const infoRow = await findRow(infoSheet, reference);
	const traineeRow = await findRow(traineeSheet, reference);

	const header = endSheet.headerValues;
	if (logRow && infoRow && traineeRow) {
		const archiveSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.archive);
		endSheet.addRow({
			[header[0]]: moment().utcOffset(8).format('MM/DD/YYYY hh:mm A'),
			[header[1]]: reference,
			[header[2]]: logRow['BUONG PANGALAN'],
			[header[3]]: logRow['PETSA ITINALA'],
			[header[4]]: traineeRow['PETSA NG SCREENING'],
			[header[5]]: petsa.trim(),
			[header[6]]: buwan.trim(),
			[header[7]]: dako.trim(),
			[header[8]]: infoRow['TAUHIN'],
			[header[9]]: infoRow['URI'],
			[header[10]]: infoRow['NAGDOKTRINA'],
			[header[11]]: infoRow['NAGAKAY'],
			[header[12]]: infoRow['PRK-GRP'],
			[header[13]]: infoRow['KAPISANAN'],
			[header[14]]: infoRow['TUNGKULIN'],
			[header[15]]: infoRow['KALAGAYANG SIBIL'],
			[header[16]]: infoRow['PANGALAN NG ASAWA']
		});

		await rstudent.finish(moment(petsa, ['MM/DD/YYYY'], true), logRow['BUONG PANGALAN'], reference, infoRow['NAGDOKTRINA']);
		await delStudent(archiveSheet, rstudent, 'Bautisado na');
	}
};

const endSubmit = async (rstudent: RStudent, interaction: ButtonInteraction | any) => {
	await interaction.deferReply({ ephemeral: true });
	try {
		const dako: string = interaction.getTextInputValue(`dako`);
		const petsa: string = interaction.getTextInputValue(`petsa`);
		let buwan: string = interaction.getTextInputValue(`buwan`);
		if (!moment(petsa, ['MM/DD/YYYY'], true).isValid()) {
			return await interaction.followUp({ ephemeral: true, content: `Invalid input for 'Petsa ng Bautismo'` });
		}
		buwan = buwan.trim().toUpperCase().substring(0, 3);
		await endStudent(rstudent, dako, petsa, buwan);
	} catch (error) {
		console.log(error);
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} failed to mark as finished` });
	} finally {
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} successfully mark as finished` });
	}
};

export default endSubmit;
