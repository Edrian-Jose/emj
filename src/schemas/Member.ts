import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';
import type { RoleDocument } from './Role';

interface Member {
	guildId: Snowflake;
	userId: Snowflake;
	nickname?: string;
}

interface MemberBaseDocument extends Member, Document {
	//add instance methods here
}

export interface MemberDocument extends MemberBaseDocument {
	//store ref typings here
	roles: RoleDocument['_id'][];
}

const MemberSchema = new Schema<MemberDocument>({
	guildId: String,
	userId: String,
	nickname: String,
	roles: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Role'
		}
	]
});

const MemberModel = model<MemberDocument>('Member', MemberSchema);

export default MemberModel;
