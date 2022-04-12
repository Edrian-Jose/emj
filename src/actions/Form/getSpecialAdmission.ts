import { container } from '@sapphire/framework';
import getSpreadsheetDocument from '../../lib/getDoc';
import createSpecialEntry from '../FormEntry/createSpecialEntry';

const getSpecialAdmissions = async () => {
	const sheet = await getSpreadsheetDocument('133Db5Kt86vyekezAT0EdYjADwhRYUvsf0S1fsM50SwU', 0);
	let stop = false;
	let index = 0;
	let totalFound = 0;
	const limit = 20;
	while (!stop) {
		const rows = await sheet.getRows({ limit, offset: index });
		let found = 0;
		for (const row of rows) {
			if (isNaN(row['Timestamp'])) {
				found++;
				const [, , id, ...data] = row._rawData;
				await row.delete();
				await createSpecialEntry('62503ecfa709bfd87f682892', id, data);
			}
		}
		totalFound += found;
		if (!found) {
			stop = true;
			container.logger.info(`${totalFound} entries performed`);
		} else {
			index += limit;
		}
	}
};

export default getSpecialAdmissions;
