import { findRow } from './../../../Form/Commands/rlog';
import type { ButtonInteraction } from 'discord.js';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import type RStudent from '../../RStudent';
import parseChannel from '../../../Channel/parseChannel';
import moment from 'moment';
import rencode from '../../../../lib/rencode';

const delStudent = async (rstudent: RStudent, reason: string) => {
	const { status } = rstudent;

	const logSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.log);
	const tab = status === 'trainee' ? rencode.tabs.trainee : rencode.tabs.student;
	const sheet = await getSpreadsheetDocument(rencode.sheet, tab);
	const deletedSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.deleted);
	const logRow = await findRow(logSheet, rstudent.reference);
	const statusRow = await findRow(sheet, rstudent.reference);
	if (logRow) {
		const row = await deletedSheet.addRow([...logRow._rawData, reason]);
		row['TIMESTAMP'] = moment().utcOffset(8).format('MM/DD/YYYY hh:mm A');
		await row.save();
		await logRow.delete();
	}

	if (statusRow) {
		await statusRow.delete();
	}
	if (rstudent.locations) {
		if (rstudent.locations.log) {
			const [allChannel] = await parseChannel(rstudent.locations.log.guildId, rstudent.locations.log.channelId);
			if (allChannel?.isText()) {
				await allChannel.messages.delete(rstudent.locations.log.messageId);
			}
		}
		const location = status === 'trainee' ? rstudent.locations.trainee : rstudent.locations.student;
		if (location) {
			const [channel] = await parseChannel(location.guildId, location.channelId);
			if (channel?.isText()) {
				await channel.messages.delete(location.messageId);
			}
		}
	}
};

const delSubmit = async (rstudent: RStudent, interaction: ButtonInteraction | any) => {
	await interaction.deferReply({ ephemeral: true });
	try {
		const reason: string | undefined = interaction.getTextInputValue(`reason`);
		await delStudent(rstudent, reason ?? 'No reason');
	} catch (error) {
		console.log(error);
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} delete failed` });
	} finally {
		await rstudent._document.delete();
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} successfully deleted` });
	}
};

export default delSubmit;
