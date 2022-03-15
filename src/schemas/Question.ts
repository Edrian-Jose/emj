import { Schema, model, Document } from 'mongoose';

export type QuestionType = 'NUMBER' | 'DATE' | 'DATETIME' | 'TEXT' | 'SELECT' | 'BOOLEAN' | 'OPTION';

interface _Question {
	creatorId: string;
	type: QuestionType;
	value: string;
	placeholder?: string;
	required?: boolean;
	default?: string;
	options: [
		{
			label: string;
			identifier: string;
		}
	];
}

export interface Question extends _Question {
	//
}

interface QuestionBaseDocument extends _Question, Document {
	//add instance methods here
}

export interface QuestionDocument extends QuestionBaseDocument {
	//store ref typings here
}

const QuestionSchema = new Schema<QuestionDocument>({
	creatorId: String,
	type: {
		type: String,
		enum: ['NUMBER', 'DATE', 'DATETIME', 'TEXT', 'SELECT', 'BOOLEAN', 'OPTION'],
		required: true,
		default: 'TEXT'
	},
	value: String,
	placeholder: String,
	required: Boolean,
	default: String,
	options: [
		{
			label: String,
			identifier: String
		}
	]
});

const QuestionModel = model<QuestionDocument>('Question', QuestionSchema);

export default QuestionModel;
