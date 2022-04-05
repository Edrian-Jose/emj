import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface Role {
	guildId: Snowflake;
	roleId: Snowflake;
	name: string;
	position: number;
	badge?: string;
	thread: {
		parent: Snowflake;
		id: Snowflake;
	};
	and?: Snowflake[];
	members: Snowflake[];
}

interface RoleBaseDocument extends Role, Document {
	//add instance methods here
}

export interface RoleDocument extends RoleBaseDocument {
	//store ref typings here
}

const RoleSchema = new Schema<RoleDocument>({
	guildId: String,
	roleId: String,
	name: String,
	position: {
		type: Number,
		default: 0
	},
	badge: String,
	thread: {
		parent: String,
		id: String
	},
	and: [String],
	members: [String]
});

const RoleModel = model<RoleDocument>('Role', RoleSchema);

export default RoleModel;
