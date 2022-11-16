import { Constants, type Message } from 'discord.js'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '../../utils'
import Colors from '@bitomic/material-colors'

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.MESSAGE_CREATE,
	name: 'fan-art-message'
} )
export class UserEvent extends Listener {
	public async run( message: Message ): Promise<void> {
		if ( message.author.bot ) return

		const models = this.container.stores.get( 'models' )
		const channelId = await models.get( 'channel-settings' ).find( 'type', ChannelTypes.FANART )

		if ( message.channelId !== channelId ) return
		if ( message.attachments.size === 0 ) return

		await models.get( 'fanarts' ).register( message.channelId, message.id, message.author.id )
		await message.react( '☑️' )
	}
}
