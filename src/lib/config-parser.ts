export const config = {
	BOT: {
		GUILD: process.env.GUILD,
		CLIENT_ID: process.env.CLIENT_ID ?? '',
		TOKEN: process.env.DISCORD_TOKEN ?? ''
	},
	REDIS: {
		HOST: process.env.REDIS_HOST,
		PASS: process.env.REDIS_PASS,
		PORT: process.env.REDIS_PORT
	},
	API: {
		PORT: parseInt(process.env.PORT ?? '4000'),
		APP_ID: process.env.DISCORD_APP_ID ?? '',
		SECRET: process.env.DISCORD_CLIENT_SECRET ?? ''
	},

	MONGO_DB: {
		URI: process.env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/emjay-bot' : process.env.MONGO_URI ?? ''
	}
};
