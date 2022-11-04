import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '../utils'
import { Listener } from '@sapphire/framework'
import type { ListenerOptions } from '@sapphire/framework'
import type { MessageOptions } from 'discord.js'

@ApplyOptions<ListenerOptions>( {
	event: 'server-log'
	} )
export class UserEvent extends Listener {
	public async run( payload: MessageOptions ): Promise<void> {
		const channelId = await this.container.stores.get( 'models' ).get( 'channel-settings' )
			.find( 'type', ChannelTypes.LOGS )
		if ( !channelId ) {
			this.container.logger.warn( 'I couldn\'t find a logs channel.' )
			return
		}

		const channel = await this.container.client.channels.fetch( channelId )
		if ( !channel || channel.type !== 'GUILD_TEXT' ) return

		void channel.send( payload )
	}
}
