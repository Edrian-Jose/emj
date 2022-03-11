export const config = {
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
		URI: process.env.MONGO_URI ?? ''
	}
};
