import type { Snowflake } from 'discord.js';
import { Schema, model, Document, Model } from 'mongoose';
import type { RoleDocument } from './Role';

interface Member {
	guildId: Snowflake;
	userId: Snowflake;
	tag: string;
	nickname?: string;
}

interface MemberBaseDocument extends Member, Document {
	//add instance methods here
}

export interface MemberDocument extends MemberBaseDocument {
	//store ref typings here
	roles?: RoleDocument['_id'][];
}
export interface MemberPopulatedDocument extends MemberDocument {
	//store ref typings here
	roles?: RoleDocument[];
}

const MemberSchema = new Schema<MemberDocument>({
	guildId: String,
	userId: String,
	tag: String,
	nickname: String,
	roles: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Role'
		}
	]
});

export interface IMemberModel extends Model<MemberDocument> {
	getAll(userId: string, guildId: string): Promise<MemberPopulatedDocument>;
}

MemberSchema.statics.getAll = async function (this: Model<MemberDocument>, userId: string, guildId: string) {
	return this.findOne({ userId, guildId }).populate('roles').exec();
};

const MemberModel = model<MemberDocument, IMemberModel>('Member', MemberSchema);

export default MemberModel;
