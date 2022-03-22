import { Schema, model, Document } from 'mongoose';

export type QuestionType = 'NUMBER' | 'DATE' | 'DATETIME' | 'TEXT' | 'SELECT' | 'BOOLEAN' | 'OPTION';

interface _Question {
	creatorId: string;
	type: QuestionType;
	value: string;
	placeholder?: string;
	required?: boolean;
	default?: string;
	command?: string;
	minSelected?: number;
	maxSelected?: number;
	options?: [
		{
			label: string;
			value: string;
			description?: string;
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
	command: String,
	default: String,
	minSelected: Number,
	maxSelected: Number,
	options: [
		{
			label: String,
			value: String,
			description: String
		}
	]
});

const QuestionModel = model<QuestionDocument>('Question', QuestionSchema);

export default QuestionModel;
