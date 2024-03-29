import type { ButtonInteraction } from 'discord.js';
import moment, { Moment } from 'moment';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import rencode from '../../../../lib/rencode';
import parseChannel from '../../../Channel/parseChannel';
import { findRow } from '../../../Form/Commands/rlog';
import type RStudent from '../../RStudent';

export const pauseStudent = async (rstudent: RStudent, dateObj: Moment, reason: string) => {
	const tab = rstudent.status === 'student' ? rencode.tabs.student : rencode.tabs.trainee;
	const registeredSheet = await getSpreadsheetDocument(rencode.sheet, tab);
	const logSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.log);
	const registeredRow = await findRow(registeredSheet, rstudent.reference);
	const logRow = await findRow(logSheet, rstudent.reference);
	if (registeredRow) {
		const removedSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.out);
		const removedHeader = removedSheet.headerValues;
		await removedSheet.addRow({
			[removedHeader[0]]: moment().utcOffset(8).format('MM/DD/YYYY hh:mm A'),
			[removedHeader[1]]: rstudent.reference,
			[removedHeader[2]]: registeredRow['UNANG PANGALAN'],
			[removedHeader[3]]: registeredRow['APELYIDO'],
			[removedHeader[4]]: rstudent.status === 'student' ? 'Doktrina' : 'Sinusubok',
			[removedHeader[5]]: dateObj.utcOffset(8).format('MM/DD/YYYY'),
			[removedHeader[6]]: rstudent.status === 'trainee' ? registeredRow['PETSA NG SCREENING'] : '',
			[removedHeader[7]]: reason ?? 'Many absences'
		});

		await registeredRow.delete();
	}

	if (rstudent.locations && logRow) {
		const location = rstudent.status === 'student' ? rstudent.locations.student : rstudent.locations.trainee;
		if (location) {
			const [locationChannel] = await parseChannel(location.guildId, location.channelId);
			if (locationChannel?.isText()) {
				await locationChannel.messages.delete(location.messageId);
			}
			const dropMessage = await rstudent.dropOut(
				dateObj,
				logRow['BUONG PANGALAN'],
				rstudent.reference,
				rstudent.status === 'student' ? 'Doktrina' : 'Sinusubok',
				reason
			);
			if (rstudent._document.locations && dropMessage) {
				rstudent._document.locations.out = {
					guildId: location.guildId,
					channelId: rencode.out,
					messageId: dropMessage.id
				};
				rstudent._document.removedAt = dateObj.valueOf();
				rstudent._document.locations.student = undefined;
				rstudent._document.locations.trainee = undefined;
				await rstudent._document.save();
			}
		}
	}
};

const pauseSubmit = async (rstudent: RStudent, interaction: ButtonInteraction | any) => {
	await interaction.deferReply({ ephemeral: true });
	//TODO: check if date registered is 3 months older now.

	try {
		const date: string | undefined = interaction.getTextInputValue(`date`);
		const reason: string | undefined = interaction.getTextInputValue(`reason`);
		const dFormats = ['MM/DD/YYYY'];
		const dateObj = moment(date, dFormats, true);
		if (!dateObj.isValid()) {
			await interaction.followUp({ content: `Invalid date format`, ephemeral: true });
		}
		await pauseStudent(rstudent, dateObj, reason ?? 'Many absences');
	} catch (error) {
		console.log(error);
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} dropping out failed` });
	} finally {
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} successfully dropped out` });
	}
};

export default pauseSubmit;
