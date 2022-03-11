import './lib/setup';
import { SapphireClient } from '@sapphire/framework';
import clientOptions from './lib/clientOptions';

const client = new SapphireClient(clientOptions);

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
