import { findRow } from './../../../Form/Commands/rlog';
import type { ButtonInteraction, Message } from 'discord.js';
import getSpreadsheetDocument from '../../../../lib/getDoc';
import rencode from '../../../../lib/rencode';
import type RStudent from '../../RStudent';
import parseChannel from '../../../Channel/parseChannel';
import moment, { Moment } from 'moment';
import type { GoogleSpreadsheetRow } from 'google-spreadsheet';
import { getRequirementsArray } from './trainSubmit';

const backStudent = async (rstudent: RStudent, dako: string, oras: string) => {
	const nowMoment = moment().utcOffset(8);
	const { status, reference, locations } = rstudent;
	const location = status === 'trainee' ? rencode.trainee : rencode.students;
	const tab = status === 'trainee' ? rencode.tabs.trainee : rencode.tabs.student;
	const sheet = await getSpreadsheetDocument(rencode.sheet, tab);
	const outSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.out);
	const logSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.log);
	const outRow = await findRow(outSheet, reference);
	const logRow = await findRow(logSheet, reference);
	let regObject: Moment = moment();
	let row: GoogleSpreadsheetRow | null = null;
	let requirements: string[] = [];
	try {
		if (outRow && logRow) {
			let rowData = {
				TIMESTAMP: nowMoment.format('MM/DD/YYYY hh:mm A'),
				'REF NO.': reference,
				'UNANG PANGALAN': outRow['UNANG PANGALAN'],
				APELYIDO: outRow['APELYIDO'],
				'DAKO NG GAWAIN': dako.trim()
			};
			const data = await getRequirementsArray(rstudent, rowData);
			requirements = data[0];
			rowData = data[1] as any;
			if (status === 'trainee') {
				rowData['PETSA NG SCREENING'] = outRow['PETSA NG SCREENING'];
				regObject = moment(outRow['PETSA NG SCREENING'], ['MM/DD/YYYY'], true);
			} else {
				rowData['ORAS NG GAWAIN'] = oras.trim();
				regObject = moment(logRow['PETSA ITINALA'], ['MM/DD/YYYY'], true);
			}

			row = await sheet.addRow(rowData);
			await outRow.delete();
		}
	} catch (error) {
		console.log(error);
	} finally {
		if (row && logRow && locations && locations.out) {
			const [outChannel] = await parseChannel(locations.out.guildId, locations.out.channelId);
			if (outChannel?.isText()) {
				await outChannel.messages.delete(locations.out.messageId);
				let message: Message | undefined;
				if (status === 'trainee') {
					message = await rstudent.train(
						regObject,
						reference,
						logRow['BUONG PANGALAN'],
						row['UNANG PANGALAN'],
						row['APELYIDO'],
						requirements.join(', ')
					);
				} else {
					message = await rstudent.studentLog(
						regObject,
						reference,
						logRow['BUONG PANGALAN'],
						row['UNANG PANGALAN'],
						row['APELYIDO'],
						dako,
						oras
					);
				}
				if (rstudent._document.locations && message) {
					rstudent._document.locations.out = undefined;
					const messageLocation = {
						guildId: rencode.guild,
						channelId: location,
						messageId: message.id
					};
					if (status === 'trainee') {
						rstudent._document.locations.trainee = messageLocation;
					} else {
						rstudent._document.locations.student = messageLocation;
					}

					rstudent._document.removedAt = undefined;
					await rstudent._document.save();
				}
			}
		}
	}
};

const backSubmit = async (rstudent: RStudent, interaction: ButtonInteraction | any) => {
	await interaction.deferReply({ ephemeral: true });

	try {
		const dako: string = interaction.getTextInputValue(`dako`);
		const oras: string = interaction.getTextInputValue(`oras`);
		if (dako) {
			await backStudent(rstudent, dako, oras);
		}
	} catch (error) {
		console.log(error);
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} transfer back failed` });
	} finally {
		return await interaction.followUp({ ephemeral: true, content: `${rstudent.reference} successfully transferred back to ${rstudent.status}` });
	}
};

export default backSubmit;
