import { findRow } from './../../../Form/Commands/rlog';
import type { ButtonInteraction } from 'discord.js';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import type RStudent from '../../RStudent';
import parseChannel from '../../../Channel/parseChannel';
import moment from 'moment';

const delSubmit = async (rstudent: RStudent, interaction: ButtonInteraction | any) => {
	await interaction.deferReply({ ephemeral: true });
	try {
		const reason: string | undefined = interaction.getTextInputValue(`reason`);
		const logSheet = await getSpreadsheetDocument('1BNluRhvfCymS4U7OGd19TmHDON2jgvzS1JvUGGxKG8A', 0);
		const studentSheet = await getSpreadsheetDocument('1BNluRhvfCymS4U7OGd19TmHDON2jgvzS1JvUGGxKG8A', 1);
		const deletedSheet = await getSpreadsheetDocument('1BNluRhvfCymS4U7OGd19TmHDON2jgvzS1JvUGGxKG8A', 6);
		const logRow = await findRow(logSheet, rstudent.reference);
		const studentRow = await findRow(studentSheet, rstudent.reference);
		if (logRow) {
			const row = await deletedSheet.addRow([...logRow._rawData, reason ?? 'No reason']);
			row['TIMESTAMP'] = moment().utcOffset(8).format('MM/DD/YYYY hh:mm A');
			await row.save();
			await logRow.delete();
		}

		if (studentRow) {
			await studentRow.delete();
		}
		if (rstudent.locations) {
			if (rstudent.locations.log) {
				const [allChannel] = await parseChannel(rstudent.locations.log.guildId, rstudent.locations.log.channelId);
				if (allChannel?.isText()) {
					await allChannel.messages.delete(rstudent.locations.log.messageId);
				}
			}
			if (rstudent.locations.student) {
				const [studChannel] = await parseChannel(rstudent.locations.student.guildId, rstudent.locations.student.channelId);
				if (studChannel?.isText()) {
					await studChannel.messages.delete(rstudent.locations.student.messageId);
				}
			}
		}
	} catch (error) {
		console.log(error);
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} delete failed` });
	} finally {
		await rstudent._document.delete();
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} successfully deleted` });
	}
};

export default delSubmit;
