import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import { LogLevel } from '@sapphire/framework';
import { config } from './config-parser';
import type { ClientOptions } from 'discord.js';

const clientOptions: ClientOptions = {
	defaultPrefix: '!',
	regexPrefix: /^(hey +)?bot[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS'
	],
	tasks: {
		strategy: new ScheduledTaskRedisStrategy({
			bull: {
				redis: {
					port: config.REDIS.PORT,
					password: config.REDIS.PASS,
					host: config.REDIS.HOST
				},
				defaultJobOptions: {
					removeOnComplete: true,
					removeOnFail: true
				}
			}
		})
	},
	api: {
		auth: {
			// The application/client ID of your bot.
			// You can find this at https://discord.com/developers/applications
			id: config.API.APP_ID,
			// The client secret of your bot.
			// You can find this at https://discord.com/developers/applications
			secret: config.API.SECRET,
			// The name of the authentication cookie.
			cookie: 'SAPPHIRE_AUTH',
			// The URL that users should be redirected to after a successful authentication
			redirect: '',
			// The scopes that should be given to the authentication.
			scopes: ['identify'],
			// Transformers to transform the raw data from Discord to a different structure.
			transformers: []
		},
		// The prefix for all routes, e.g. / or v1/.
		prefix: '',
		// The origin header to be set on every request at 'Access-Control-Allow-Origin.
		origin: '*',
		// Any options passed to the NodeJS "net" internal server.listen function
		// See https://nodejs.org/api/net.html#net_server_listen_options_callback
		listenOptions: {
			port: config.API.PORT
		}
	}
};

export default clientOptions;
