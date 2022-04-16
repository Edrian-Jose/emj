import { Schema, model, Document } from 'mongoose';
import type { FormDocument } from './Form';

interface GForm {
	spreadSheetId: string;
	spreadSheetTabIndex: number;
	limit?: number;
	offsetColumn: number;
	enabled?: boolean;
}

interface GFormBaseDocument extends GForm, Document {
	//add instance methods here
}

export interface GFormDocument extends GFormBaseDocument {
	//store ref typings here
	form: FormDocument['_id'];
}

export interface GFormPopulatedDocument extends GFormDocument {
	form: FormDocument;
}

const GFormSchema = new Schema<GFormDocument>({
	spreadSheetId: String,
	spreadSheetTabIndex: {
		type: Number,
		default: 0
	},
	limit: {
		type: Number,
		default: 20
	},
	offsetColumn: {
		type: Number,
		default: 2
	},
	form: {
		type: Schema.Types.ObjectId,
		ref: 'Form'
	},
	enabled: {
		type: Boolean,
		default: true
	}
});

const GFormModel = model<GFormDocument>('GForm', GFormSchema);

export default GFormModel;
