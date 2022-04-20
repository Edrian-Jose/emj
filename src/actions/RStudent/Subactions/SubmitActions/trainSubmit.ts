import type { ButtonInteraction } from 'discord.js';
import moment, { Moment } from 'moment';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import rencode from '../../../../lib/rencode';
import parseChannel from '../../../Channel/parseChannel';
import { findRow } from '../../../Form/Commands/rlog';
import type RStudent from '../../RStudent';

const trainStudent = async (rstudent: RStudent, dateObj: Moment) => {
	try {
		const studentSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.student);
		const traineeSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.trainee);
		const logSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.log);

		const studentRow = await findRow(studentSheet, rstudent.reference);
		const logRow = await findRow(logSheet, rstudent.reference);

		if (rstudent.locations && studentRow && logRow) {
			if (rstudent.locations.student) {
				const [studChannel] = await parseChannel(rstudent.locations.student.guildId, rstudent.locations.student.channelId);
				if (studChannel?.isText()) {
					await studChannel.messages.delete(rstudent.locations.student.messageId);
				}

				const trainMessage = await rstudent.train(
					dateObj,
					rstudent.reference,
					logRow['BUONG PANGALAN'],
					studentRow['UNANG PANGALAN'],
					studentRow['APELYIDO']
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

			const traineeHeader = traineeSheet.headerValues;
			await traineeSheet.addRow({
				[traineeHeader[0]]: moment().utcOffset(8).format('MM/DD/YYYY hh:mm A'),
				[traineeHeader[1]]: dateObj.utcOffset(8).format('MM/DD/YYYY'),
				[traineeHeader[2]]: rstudent.reference,
				[traineeHeader[3]]: studentRow['UNANG PANGALAN'],
				[traineeHeader[4]]: studentRow['APELYIDO'],
				[traineeHeader[5]]: studentRow['DAKO NG GAWAIN']
			});
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
