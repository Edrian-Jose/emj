import { container } from '@sapphire/framework';
import moment from 'moment';
import getSpreadsheetDocument from '../../../lib/getDoc';
import rencode from '../../../lib/rencode';
import RStudentModel from '../../../schemas/RStudent';
import parseChannel from '../../Channel/parseChannel';
import type FormEntry from '../../FormEntry/FormEntry';
import RStudent from '../../RStudent/RStudent';
import type { EntryAnswer } from '../handleFormCommand';
import { capFirstLetter } from './rlog';

const rinfo = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	if (entry.form.sheet) {
		container.logger.info(`${entry.form.sheet.id} ${entry.form.sheet?.index} has been used`);
	}

	const petsaItinalaObject = moment(parseInt(answers[0].value![0])).utcOffset(8);
	const petsaItinala = petsaItinalaObject.format('MM/DD/YYYY');
	const referenceNum = answers[1].value![0];
	const givenName = answers[2].value![0];
	const mms = answers[3].value && answers[3].value.length ? answers[3].value[0] : '-';
	const fsn = answers[4].value && answers[4].value.length ? answers[4].value[0] : '-';
	const hsn = answers[5].value && answers[5].value.length ? answers[5].value[0] : '-';
	const fullname = [
		capFirstLetter(givenName),
		mms !== '-' ? capFirstLetter(mms) : undefined,
		hsn !== '-'
			? fsn !== '-'
				? `${capFirstLetter(fsn)} - ${capFirstLetter(hsn)}`
				: `- ${capFirstLetter(hsn)}`
			: fsn !== '-'
			? capFirstLetter(fsn)
			: undefined
	].join(' ');
	const tauhin = answers[6].value![0];
	const birthdateObj = moment(parseInt(answers[7].value![0])).utcOffset(8);
	const birthdate = birthdateObj.format('MM/DD/YYYY');
	const address = answers[8].value![0];
	const uri = answers[9].value![0];
	const kalSibil = answers[10].value![0];
	const asawaName = answers[11].value ? answers[11].value[0] : '-';
	const asawaTirahan = answers[12].value ? answers[12].value[0] : '-';
	const asawaRelihiyon = answers[13].value ? answers[13].value[0] : '-';
	const nagdoktrina = answers[14].value![0];
	const nagakay = answers[15].value![0];
	const nagakayPG = answers[16].value![0];
	const nagakayKap = answers[17].value![0];
	const nagakayTungkulin = answers[18].value![0];
	const katGrupo = answers[19].value![0];
	const katPurok = answers[20].value![0];
	const kalGawain = answers[21].value![0];
	try {
		const infoSheet = await getSpreadsheetDocument(rencode.sheet, rencode.tabs.information);

		const infoHeader = infoSheet.headerValues;

		infoSheet.addRow({
			[infoHeader[0]]: moment().utcOffset(8).format('MM/DD/YYYY hh:mm A'),
			[infoHeader[1]]: petsaItinala,
			[infoHeader[2]]: referenceNum,
			[infoHeader[3]]: givenName,
			[infoHeader[4]]: mms,
			[infoHeader[5]]: fsn,
			[infoHeader[6]]: hsn,
			[infoHeader[7]]: tauhin,
			[infoHeader[8]]: birthdate,
			[infoHeader[9]]: address,
			[infoHeader[10]]: uri,
			[infoHeader[11]]: kalSibil,
			[infoHeader[12]]: asawaName,
			[infoHeader[13]]: asawaTirahan,
			[infoHeader[14]]: asawaRelihiyon,
			[infoHeader[15]]: nagdoktrina,
			[infoHeader[16]]: nagakay,
			[infoHeader[17]]: nagakayPG,
			[infoHeader[18]]: nagakayKap,
			[infoHeader[19]]: nagakayTungkulin,
			[infoHeader[20]]: katGrupo,
			[infoHeader[21]]: katPurok,
			[infoHeader[22]]: kalGawain
		});
	} catch (error) {
		console.log(error);
	} finally {
		let _rstudent = await RStudentModel.findOne({ reference: referenceNum.trim() }).exec();
		try {
			if (_rstudent && _rstudent.locations) {
				const rstudent = new RStudent(_rstudent);
				const infom = await rstudent.info(fullname, answers);
				if (infom) {
					_rstudent.locations.information = {
						guildId: rencode.guild,
						channelId: rencode.information,
						messageId: infom.id
					};
					_rstudent = await _rstudent.save();
				}
			}
		} catch (error) {
			console.log(error);
		} finally {
			try {
				if (_rstudent && _rstudent.locations && _rstudent.locations.student) {
					const newRstudent = new RStudent(_rstudent);
					const [channel] = await parseChannel(_rstudent.locations.student.guildId, _rstudent.locations.student.channelId);
					if (channel?.isText()) {
						const message = await channel.messages.fetch(_rstudent.locations.student.messageId);
						await message.edit({
							embeds: [message.embeds[0]],
							components: newRstudent.createComponents(),
							content: `${message.content}`
						});
					}
				}
			} catch (error) {
				console.log(error);
			}
		}
	}
};

export default rinfo;
