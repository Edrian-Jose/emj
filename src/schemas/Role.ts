import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface Role {
	guildId: Snowflake;
	roleId: Snowflake;
	name: string;
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
	name: String
});

const RoleModel = model<RoleDocument>('Role', RoleSchema);

export default RoleModel;
