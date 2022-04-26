import { userMention } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import moment from 'moment';
import RNotif from '../../../components/embeds/notif';
import getSpreadsheetDocument from '../../../lib/getDoc';
import rencode from '../../../lib/rencode';
import type { Location } from '../../../schemas/RStudent';
import RStudentModel from '../../../schemas/RStudent';
import parseChannel from '../../Channel/parseChannel';
import { findRow } from '../../Form/Commands/rlog';
import RStudent from '../RStudent';

const rArchive = async (rstudent: RStudent) => {
	const { reference } = rstudent;
	const archiveSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.archive);
	const logSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.log);
	const outSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.out);

	const logRow = await findRow(logSheet, reference);
	const outRow = await findRow(outSheet, reference);

	if (logRow && outRow) {
		const row = await archiveSheet.addRow([...logRow._rawData, '3 months na mula ng naitigil']);
		row['TIMESTAMP'] = moment().utcOffset(8).format('MM/DD/YYYY hh:mm A');
		await row.save();
		await logRow.delete();
		await outRow.delete();
	}

	try {
		if (rstudent.locations) {
			for (const type in rstudent.locations) {
				if (Object.prototype.hasOwnProperty.call(rstudent.locations, type)) {
					const location: Location | undefined = rstudent.locations[type];
					if (location) {
						const [channel] = await parseChannel(location.guildId, location.channelId);
						if (channel?.isText()) {
							await channel.messages.delete(location.messageId);
						}
					}
				}
			}
		}
	} catch (error) {
		console.log(error);
	} finally {
		await rstudent._document.delete();
	}
};

export const archiveStudents = async () => {
	const _rstudents = await RStudentModel.find({
		removedAt: { $lte: moment().subtract(3, 'months').valueOf() }
	});

	for (const _rstudent of _rstudents) {
		const rstudent = new RStudent(_rstudent);
		await rArchive(rstudent);
	}
	container.logger.info(`${_rstudents.length} rstudents has been archived`);
};

export const getNotifiableStudents = async () => {
	const _rdrops = await RStudentModel.find({
		registeredAt: { $lte: moment().subtract(3, 'months').valueOf() },
		status: 'student',
		removedAt: { $exists: false }
	});

	const _rscreen = await RStudentModel.find({
		$and: [
			{ registeredAt: { $gt: moment().subtract(3, 'months').valueOf() }, status: 'student' },
			{ registeredAt: { $lte: moment().subtract(1, 'months').valueOf() } },
			{ removedAt: { $exists: false } }
		]
	});
	const forDropping: string[] = _rdrops.map((_r) => _r.reference.trim());
	const forScreening: string[] = _rscreen.map((_r) => _r.reference.trim());
	const [notifChannel] = await parseChannel(rencode.guild, rencode.notifications);

	if (notifChannel?.isText()) {
		await notifChannel.send({
			embeds: [RNotif(forScreening, forDropping)],
			content: `${userMention('763274042059784233')}`
		});
	}
};

export default rArchive;
