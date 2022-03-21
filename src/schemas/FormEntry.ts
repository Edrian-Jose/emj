import type { QuestionDocument } from './Question';
import type { Snowflake } from 'discord.js';
import { Schema, model, Document, Model } from 'mongoose';
import type { FormDocument } from './Form';

interface _FormEntry {
	location: {
		type: 'DM' | 'GUILD_TEXT';
		guildId?: Snowflake;
		channelId: Snowflake;
	};
	ownerId: Snowflake;
	navigatorId: Snowflake;
	questionId: Snowflake;
	index: number;
}
export interface FormEntry extends _FormEntry {
	form: FormDocument | FormDocument['_id'];
	answers: {
		question: QuestionDocument | QuestionDocument['_id'];
		answer?: string;
	}[];
}

interface FormEntryBaseDocument extends _FormEntry, Document {
	//add instance methods here
}

export interface FormEntryDocument extends FormEntryBaseDocument {
	//store ref typings here
	form: FormDocument['_id'];
	answers: [
		{
			question: QuestionDocument['_id'];
			answer?: string;
		}
	];
}
export interface FormEntryPopulatedDocument extends FormEntryDocument {
	//store ref typings here
	form: FormDocument;
	answers: [
		{
			question: QuestionDocument;
			answer?: string;
		}
	];
}

const FormEntrySchema = new Schema<FormEntryDocument>({
	location: {
		type: {
			type: String
		},
		guildId: String,
		channelId: String
	},
	navigatorId: String,
	questionId: String,
	ownerId: String,
	index: {
		type: Number,
		required: true,
		default: 0
	},
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

export interface FormEntryModel extends Model<FormEntryDocument> {
	getAll(id: string): Promise<FormEntryPopulatedDocument>;
}

FormEntrySchema.statics.getAll = async function (this: Model<FormEntryDocument>, id: string) {
	return this.findById(id)
		.populate([
			{
				path: 'answers',
				populate: {
					path: 'question',
					model: 'Question'
				}
			},
			{
				path: 'form',
				populate: {
					path: 'questions',
					model: 'Question'
				}
			}
		])
		.exec();
};

export default model<FormEntryDocument, FormEntryModel>('FormEntry', FormEntrySchema);
