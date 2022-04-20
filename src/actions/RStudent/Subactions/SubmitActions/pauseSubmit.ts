import type { ButtonInteraction } from 'discord.js';
import moment from 'moment';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import rencode from '../../../../lib/rencode';
import parseChannel from '../../../Channel/parseChannel';
import { findRow } from '../../../Form/Commands/rlog';
import type RStudent from '../../RStudent';

const pauseSubmit = async (rstudent: RStudent, interaction: ButtonInteraction | any) => {
	await interaction.deferReply({ ephemeral: true });
	console.log(rstudent);

	try {
		const date: string | undefined = interaction.getTextInputValue(`date`);
		const reason: string | undefined = interaction.getTextInputValue(`reason`);
		const dFormats = ['MM/DD/YYYY'];
		const dateObj = moment(date, dFormats, true);
		if (!dateObj.isValid()) {
			await interaction.followUp({ content: `Invalid date format`, ephemeral: true });
		}

		const studentSheet = await getSpreadsheetDocument('1BNluRhvfCymS4U7OGd19TmHDON2jgvzS1JvUGGxKG8A', 1);
		const logSheet = await getSpreadsheetDocument('1BNluRhvfCymS4U7OGd19TmHDON2jgvzS1JvUGGxKG8A', 0);
		const studentRow = await findRow(studentSheet, rstudent.reference);
		const logRow = await findRow(logSheet, rstudent.reference);
		if (studentRow && logRow) {
			await studentRow.delete();
			const removedSheet = await getSpreadsheetDocument('1BNluRhvfCymS4U7OGd19TmHDON2jgvzS1JvUGGxKG8A', 4);
			const removedHeader = removedSheet.headerValues;
			await removedSheet.addRow({
				[removedHeader[0]]: moment().utcOffset(8).format('MM/DD/YYYY hh:mm A'),
				[removedHeader[1]]: rstudent.reference,
				[removedHeader[2]]: logRow['BUONG PANGALAN'],
				[removedHeader[3]]: rstudent.status === 'student' ? 'Doktrina' : 'Sinusubok',
				[removedHeader[4]]: date,
				[removedHeader[5]]: reason ?? 'Many absences'
			});
		}

		if (rstudent.locations && logRow) {
			if (rstudent.locations.student) {
				const [studChannel] = await parseChannel(rstudent.locations.student.guildId, rstudent.locations.student.channelId);
				if (studChannel?.isText()) {
					await studChannel.messages.delete(rstudent.locations.student.messageId);
				}
				const dropMessage = await rstudent.dropOut(
					dateObj,
					logRow['BUONG PANGALAN'],
					rstudent.reference,
					rstudent.status === 'student' ? 'Doktrina' : 'Sinusubok',
					reason ?? 'Many absences'
				);
				if (rstudent._document.locations && dropMessage) {
					rstudent._document.locations.out = {
						guildId: rstudent.locations.student.guildId,
						channelId: rencode.out,
						messageId: dropMessage.id
					};
					rstudent._document.removedAt = dateObj.valueOf();
					rstudent._document.locations.student = undefined;
					await rstudent._document.save();
				}
			}
		}
	} catch (error) {
		console.log(error);
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} dropping out failed` });
	} finally {
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} successfully dropped out` });
	}
};

export default pauseSubmit;
