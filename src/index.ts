import './lib/setup';
const discordModals = require('discord-modals');
import { SapphireClient } from '@sapphire/framework';
import clientOptions from './lib/clientOptions';
import registerSlashes from './register';

const client = new SapphireClient(clientOptions);

const main = async () => {
	try {
		discordModals(client);
		client.logger.info('Logging in');
		await client.login();
		await registerSlashes(process.env.REGISTER);
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
