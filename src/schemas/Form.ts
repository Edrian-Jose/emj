import type { QuestionDocument } from './Question';
import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

export type FormType = 'STEP' | 'SINGLE';
export type FormDestinationType = 'USER_DM' | 'ROLE_DM' | 'GUILD_CHANNEL';
export type FormResultDestinationType = 'DM_AUTHOR' | 'GUILD_CHANNEL';

interface _Form {
	creatorId: Snowflake;
	author: {
		userId: Snowflake;
		name: string;
		avatarURL: string;
	};
	title: string;
	type: FormType;
	description?: string;
	requiredRoles: Snowflake[];
	rewardRoles: Snowflake[];
	destination: [
		{
			type: FormDestinationType;
			ids: Snowflake[];
		}
	];
	commands?: {
		onSubmit?: string[];
		onCancel?: string[];
	};
	resultDestination: {
		type: FormResultDestinationType;
		id: Snowflake;
	};
	instances: [
		{
			type: FormDestinationType;
			channelId: Snowflake;
			messageId: Snowflake;
		}
	];
	verification: boolean;
}

export interface Form extends _Form {
	questions: QuestionDocument[] | QuestionDocument['_id'][];
}

interface FormBaseDocument extends _Form, Document {
	//add instance methods here
}

export interface FormDocument extends FormBaseDocument {
	//store ref typings here
	questions: QuestionDocument['_id'][];
}

const FormSchema = new Schema<FormDocument>({
	creatorId: String,
	author: {
		userId: String,
		name: String,
		avatarURL: String
	},
	title: String,
	type: {
		type: String,
		enum: ['STEP', 'SINGLE'],
		required: true,
		default: 'STEP'
	},
	description: String,
	requiredRoles: [String],
	rewardRoles: [String],
	destination: [
		{
			type: {
				type: String,
				enum: ['USER_DM', 'ROLE_DM', 'GUILD_CHANNEL'],
				required: true
			},
			ids: [String]
		}
	],
	commands: {
		onSubmit: [String],
		onCancel: [String]
	},
	resultDestination: {
		type: {
			type: String,
			enum: ['DM_AUTHOR', 'GUILD_CHANNEL'],
			required: true
		},
		id: String
	},

	verification: Boolean,
	instances: [
		{
			type: {
				type: String,
				enum: ['USER_DM', 'ROLE_DM', 'GUILD_CHANNEL'],
				required: true
			},
			channelId: String,
			messageId: String
		}
	],
	questions: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Question'
		}
	]
});

const FormModel = model<FormDocument>('Form', FormSchema);

export default FormModel;
