import { findRows } from './rlog';
import getSpreadsheetDocument from '../../../lib/getDoc';
import RStudentModel from '../../../schemas/RStudent';
import parseChannel from '../../Channel/parseChannel';
import type FormEntry from '../../FormEntry/FormEntry';
import RStudent from '../../RStudent/RStudent';
import type { EntryAnswer } from '../handleFormCommand';

const rdako = async (entry: FormEntry, ...answers: EntryAnswer[]): Promise<void> => {
	if (entry.form.sheet) {
		const sheet = await getSpreadsheetDocument(entry.form.sheet.id, entry.form.sheet.index);
		const dako = answers[0].value![0];
		const oras = answers[1].value![0];
		const references = answers[2].value![0].split(',').map((ref) => ref.trim());
		for (const ref of references) {
			const _rstudent = await RStudentModel.findOne({ reference: ref }).exec();

			if (_rstudent && _rstudent.locations && _rstudent.locations.student) {
				const rstudent = new RStudent(_rstudent);
				const [channel] = await parseChannel(_rstudent.locations.student.guildId, _rstudent.locations.student.channelId);
				if (channel?.isText()) {
					const message = await channel.messages.fetch(_rstudent.locations.student.messageId);
					const embedFields = message.embeds[0].fields.map((field) => {
						if (field.name === 'Dako ng Gawain') {
							field.value = dako;
						}
						if (field.name === 'Oras ng Gawain') {
							field.value = oras;
						}
						return field;
					});
					await message.edit({
						embeds: [message.embeds[0].setFields(embedFields)],
						components: rstudent.createComponents(),
						content: `${rstudent.reference} ${dako} ${oras}`
					});
				}
			}
		}

		const rows = await findRows(sheet, references);
		if (rows) {
			for (const row of rows) {
				row['DAKO NG GAWAIN'] = dako;
				row['ORAS NG GAWAIN'] = oras;
				await row.save();
			}
		}
	}
};

export default rdako;
