import { container, LogLevel, SapphireClient } from '@sapphire/framework'
import { env } from './environment'
import { Constants, Intents } from 'discord.js'
import { ModelStore } from '../framework'
import Redis from 'ioredis'
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis'
import type { Sequelize } from 'sequelize'
import { sequelize } from './Sequelize'
import { v4 } from 'uuid'

export class UserClient extends SapphireClient {
	public constructor() {
		super( {
			defaultPrefix: env.DISCORD_PREFIX ?? '!',
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_VOICE_STATES
			],
			loadDefaultErrorListeners: true,
			loadMessageCommandListeners: true,
			logger: {
				level: LogLevel.Info
			},
			partials: [ 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION' ],
			tasks: {
				strategy: new ScheduledTaskRedisStrategy( {
					bull: {
						connection: {
							db: env.REDIS_DB,
							host: env.REDIS_HOST,
							password: env.REDIS_PASSWORD,
							port: env.REDIS_PORT,
							username: env.REDIS_USERNAME
						},
						defaultJobOptions: {
							removeOnComplete: true
						}
					}
				} )
			}
		} )
		container.ready = async (): Promise<true> => {
			if ( this.isReady() ) return true

			const identifier = v4()
			container.logger.info( `A function is waiting for a ready event (${ identifier })` )
			const logDone = () => container.logger.info( `The ready event was sent to ${ identifier }` )

			await Promise.race( [
				setTimeout( logDone, 1000 * 10 ),
				new Promise<void>( resolve => {
					this.on( Constants.Events.CLIENT_READY, () => {
						logDone()
						resolve()
					} )
				} )
			] )

			return true
		}
		container.redis = new Redis( {
			db: env.REDIS_DB,
			host: env.REDIS_HOST,
			password: env.REDIS_PASSWORD,
			port: env.REDIS_PORT,
			username: env.REDIS_USERNAME
		} )
		container.sequelize = sequelize
		container.stores.register( new ModelStore() )
	}

	public async start(): Promise<void> {
		await this.login( env.DISCORD_TOKEN )
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		ready: () => Promise<true>
		redis: Redis
		sequelize: Sequelize
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		'auto-verify': never
		'close-battle-trade': never
	}
}
