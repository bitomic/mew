import { ApplyOptions } from '@sapphire/decorators'
import { Listener } from '@sapphire/framework'
import type { ListenerOptions } from '@sapphire/framework'

@ApplyOptions<ListenerOptions>( {
	event: 'ready',
	once: true
} )
export class UserEvent extends Listener {
	public async run(): Promise<void> {
		this.container.logger.info( `Ready! as ${ this.container.client.user?.tag ?? 'unknown user' }` )

		await this.container.sequelize.sync()
		this.container.client.user?.setPresence( {
			activities: [ {
				name: `Pokémon | Versión ${ process.env.npm_package_version ?? '1.0.0' }`,
				type: 'COMPETING'
			} ]
		} )
	}
}
