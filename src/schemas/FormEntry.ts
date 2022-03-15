import type { QuestionDocument } from './Question';
import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface FormEntry {
	ownerId: Snowflake;
}

interface FormEntryBaseDocument extends FormEntry, Document {
	//add instance methods here
}

export interface FormEntryDocument extends FormEntryBaseDocument {
	//store ref typings here
	form: FormEntryDocument['_id'];
	answers: [
		{
			question: QuestionDocument['_id'];
			answer: string;
		}
	];
}

const FormEntrySchema = new Schema<FormEntryDocument>({
	ownerId: String,
	answers: [
		{
			question: {
				type: Schema.Types.ObjectId,
				ref: 'Question'
			},
			answer: String
		}
	],
	form: {
		type: Schema.Types.ObjectId,
		ref: 'Form'
	}
});

const FormEntryModel = model<FormEntryDocument>('FormEntry', FormEntrySchema);

export default FormEntryModel;
