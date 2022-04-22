import { GoogleSpreadsheet } from 'google-spreadsheet';
import creds from './creds.json';

const getSpreadsheetDocument = async (sheetId: string, index: number = 0) => {
	const doc = new GoogleSpreadsheet(sheetId);
	try {
		await doc.useServiceAccountAuth(creds);
		await doc.loadInfo();
	} catch (error) {
		console.log(error);
	} finally {
		try {
			await doc.sheetsByIndex[index].loadHeaderRow();
		} catch (error) {
			console.log(error);
		} finally {
			return doc.sheetsByIndex[index];
		}
		
	}
};

export default getSpreadsheetDocument;
