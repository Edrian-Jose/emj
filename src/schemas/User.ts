import type { Snowflake } from 'discord.js';
import { Schema, model, Document } from 'mongoose';

interface User {
	userId: Snowflake;
}

interface UserBaseDocument extends User, Document {
	//add instance methods here
}

export interface UserDocument extends UserBaseDocument {
	//store ref typings here
}

const UserSchema = new Schema<UserDocument>({
	userId: String
});

const UserModel = model<UserDocument>('User', UserSchema);

export default UserModel;
