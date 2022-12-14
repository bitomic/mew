import { load } from 'ts-dotenv'

export const env = load( {
	DISCORD_DEVELOPMENT_SERVER: String,
	DISCORD_OWNER: String,
	DISCORD_PREFIX: {
		optional: true,
		type: String
	},
	DISCORD_TOKEN: String,
	IMGUR_CLIENT_ID: String,
	IMGUR_CLIENT_SECRET: String,
	MYSQL_DATABASE: String,
	MYSQL_HOST: String,
	MYSQL_PASSWORD: String,
	MYSQL_PORT: {
		default: 3306,
		type: Number
	},
	MYSQL_USERNAME: String,
	NODE_ENV: [
		'development' as const,
		'production' as const
	],
	REDIS_DB: Number,
	REDIS_HOST: String,
	REDIS_PASSWORD: String,
	REDIS_PORT: Number,
	REDIS_USERNAME: String
} )
