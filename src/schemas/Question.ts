import { Schema, model, Document } from 'mongoose';

export type QuestionType = 'NUMBER' | 'DATE' | 'DATETIME' | 'TEXT' | 'SELECT' | 'BOOLEAN' | 'OPTION';

interface Question {
	type: QuestionType;
	value: string;
	placeholder?: string;
	required?: boolean;
	default: string;
}

interface QuestionBaseDocument extends Question, Document {
	//add instance methods here
}

export interface QuestionDocument extends QuestionBaseDocument {
	//store ref typings here
}

const QuestionSchema = new Schema<QuestionDocument>({
	type: {
		type: String,
		enum: ['NUMBER', 'DATE', 'DATETIME', 'TEXT', 'SELECT', 'BOOLEAN', 'OPTION'],
		required: true,
		default: 'TEXT'
	},
	value: String,
	placeholder: String,
	required: Boolean,
	default: String
});

const QuestionModel = model<QuestionDocument>('Form', QuestionSchema);

export default QuestionModel;
