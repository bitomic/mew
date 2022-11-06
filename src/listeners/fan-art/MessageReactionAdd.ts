import { Constants, type MessageReaction, type User } from 'discord.js'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '../../utils'

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.MESSAGE_REACTION_ADD,
	name: 'fan-art-reaction'
} )
export class UserEvent extends Listener {
	public async run( reaction: MessageReaction, user: User ): Promise<void> {
		if ( user.bot ) return
		const models = this.container.stores.get( 'models' )
		const channelId = await models.get( 'channel-settings' ).find( 'type', ChannelTypes.FANART )
		if ( reaction.message.channelId !== channelId ) return

		const message = await reaction.message.fetch()
			.catch( () => null )
		if ( !message ) return
		const max = message.reactions.cache.map( r => r.count ).reduce( ( result, count ) => Math.max( result, count ), 0 )
		await models.get( 'fanarts' ).updateReacts( message.id, max )
	}
}
