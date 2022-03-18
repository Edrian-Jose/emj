import { container } from '@sapphire/framework';
import mongoose from 'mongoose';
import { config } from './config-parser';

export default {
	uri: config.MONGO_DB.URI,
	dbOptions: {
		keepAlive: true,
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	async connect() {
		await mongoose.connect(this.uri, this.dbOptions).then(() => {
			container.client.logger.info(`Connected to ${mongoose.connection.host}`);
		});
		return mongoose;
	}
};
