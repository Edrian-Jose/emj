import { container } from '@sapphire/framework';
import getSpreadsheetDocument from '../../lib/getDoc';
import GFormModel from '../../schemas/GForm';
import createSpecialEntry from '../FormEntry/createSpecialEntry';

const getSpecialAdmissions = async () => {
	const gforms = await GFormModel.find({ enabled: true }).exec();

	for (const { spreadSheetId, spreadSheetTabIndex, limit, form, offsetColumn } of gforms) {
		try {
			const sheet = await getSpreadsheetDocument(spreadSheetId, spreadSheetTabIndex);
			let stop = false;
			let index = 0;
			let totalFound = 0;
			while (!stop) {
				const rows = await sheet.getRows({ limit: limit ?? 20, offset: index });
				let found = 0;
				for (const row of rows) {
					if (isNaN(row['Timestamp'])) {
						found++;
						row._rawData.splice(0, offsetColumn);
						const [id, ...data] = row._rawData;
						await row.delete();
						await createSpecialEntry(form, id, data);
					}
				}
				totalFound += found;
				if (!found) {
					stop = true;
					container.logger.info(`${totalFound} entries performed`);
				} else {
					index += limit ?? 20;
				}
			}
		} catch (error) {
			console.log(error);
		}
	}
};

export default getSpecialAdmissions;
