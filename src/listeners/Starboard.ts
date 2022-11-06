import { Constants, type MessageReaction, type User } from 'discord.js'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '../utils'


@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.MESSAGE_REACTION_ADD
} )
export class UserEvent extends Listener {
	public async run( reaction: MessageReaction, user: User ): Promise<void> {
		if ( user.bot ) return
		const models = this.container.stores.get( 'models' )
		const starboardId = await models.get( 'channel-settings' ).find( 'type', ChannelTypes.STARBOARD )
		if ( !starboardId ) return

		const message = await reaction.message.fetch()
			.catch( () => null )
		if ( !message ) return

		const count = message.reactions.resolve( '⭐' )?.count
		if ( !count || count < 4 ) return

		const starboardMessages = models.get( 'starboard-messages' )
		const isAlreadyPinned = await starboardMessages.has( message.id )
		if ( !isAlreadyPinned ) {
			await models.get( 'starboard-messages' ).register( message )
			return
		}

		const starboard = await this.container.client.channels.fetch( starboardId )
		if ( !starboard || starboard.type !== 'GUILD_TEXT' ) return
		const pinId = await starboardMessages.getPinnedMessage( message.id )
		if ( !pinId ) return
		const pin = await starboard.messages.fetch( pinId )
			.catch( () => null )
		if ( !pin ) return

		await pin.edit( {
			content: `⭐ ${ count }`
		} )
	}
}
