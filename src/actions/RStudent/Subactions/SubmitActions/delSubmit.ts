import { findRow } from './../../../Form/Commands/rlog';
import type { ButtonInteraction } from 'discord.js';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import type RStudent from '../../RStudent';
import parseChannel from '../../../Channel/parseChannel';
import moment from 'moment';
import rencode from '../../../../lib/rencode';
import type { Location } from '../../../../schemas/RStudent';

export const delStudent = async (rstudent: RStudent, reason: string) => {
	const { status, reference } = rstudent;

	const logSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.log);
	const tab = rstudent.removedAt ? rencode.tabs.out : rstudent.status === 'trainee' ? rencode.tabs.trainee : rencode.tabs.student;
	const sheet = await getSpreadsheetDocument(rencode.sheet, tab);
	const deletedSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.deleted);
	const logRow = await findRow(logSheet, reference);
	const statusRow = await findRow(sheet, reference);
	if (logRow) {
		const row = await deletedSheet.addRow([...logRow._rawData, reason]);
		row['TIMESTAMP'] = moment().utcOffset(8).format('MM/DD/YYYY hh:mm A');
		await row.save();
		await logRow.delete();
	}

	if (statusRow) {
		await statusRow.delete();
	}

	if (status === 'trainee') {
		const infoSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.information);
		const infoRow = await findRow(infoSheet, reference);
		if (infoRow) {
			await infoRow.delete();
		}
	}

	if (rstudent.locations) {
		for (const type in rstudent.locations) {
			if (Object.prototype.hasOwnProperty.call(rstudent.locations, type)) {
				const location: Location = rstudent.locations[type];
				const [channel] = await parseChannel(location.guildId, location.channelId);
				if (channel?.isText()) {
					await channel.messages.delete(location.messageId);
				}
			}
		}
	}

	await rstudent._document.delete();
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
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} successfully deleted` });
	}
};

export default delSubmit;
