import type { Snowflake } from 'discord.js';
import { Schema, model, Document, Model } from 'mongoose';
import type { RoleDocument } from './Role';

export type BadgeTypes = 'assigned' | 'custom' | 'role';

interface Member {
	guildId: Snowflake;
	userId: Snowflake;
	tag: string;
	probationRoles?: Snowflake[];
	nickname?: string;
	badge?: {
		assigned?: string;
		custom?: string;
		role?: string;
	};
	manageable: boolean;
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
	probationRoles: [String],
	badge: {
		assigned: String,
		custom: String,
		role: String
	},
	roles: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Role'
		}
	],
	manageable: {
		type: Boolean,
		default: true
	}
});

export interface IMemberModel extends Model<MemberDocument> {
	getAll(userId: string, guildId: string): Promise<MemberPopulatedDocument>;
}

MemberSchema.statics.getAll = async function (this: Model<MemberDocument>, userId: string, guildId: string) {
	return this.findOne({ userId, guildId }).populate('roles').exec();
};

const MemberModel = model<MemberDocument, IMemberModel>('Member', MemberSchema);

export default MemberModel;
