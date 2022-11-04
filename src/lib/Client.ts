import { container, LogLevel, SapphireClient } from '@sapphire/framework'
import { env } from './environment'
import { Intents } from 'discord.js'
import { ModelStore } from '../framework'
import type { Sequelize } from 'sequelize'
import { sequelize } from './Sequelize'

export class UserClient extends SapphireClient {
	public constructor() {
		super( {
			defaultPrefix: env.DISCORD_PREFIX ?? '!',
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_MESSAGES
			],
			loadDefaultErrorListeners: true,
			loadMessageCommandListeners: true,
			logger: {
				level: LogLevel.Info
			},
			partials: [ 'CHANNEL', 'MESSAGE', 'REACTION' ]
		} )
		container.cache = {}
		container.sequelize = sequelize
		container.stores.register( new ModelStore() )
	}

	public async start(): Promise<void> {
		await this.login( env.DISCORD_TOKEN )
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		cache: Partial<CacheEntries>
		sequelize: Sequelize
	}
}

export interface CacheEntries {
	channels: {
		[ key: string ]: Record<string, string | null>
	}
}
