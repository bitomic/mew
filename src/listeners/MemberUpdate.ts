import { Constants, type GuildMember } from 'discord.js'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '../utils'

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.GUILD_MEMBER_UPDATE
} )
export class UserEvent extends Listener {
	public async run( oldMember: GuildMember, newMember: GuildMember ): Promise<void> {
		if ( oldMember.roles.cache.size === 1 && newMember.roles.cache.size > 1 ) {
			const generalId = await this.container.stores.get( 'models' ).get( 'channel-settings' )
				.getSettingCache( 'type', ChannelTypes.GENERAL )
			if ( !generalId ) return

			const channel = await this.container.client.channels.fetch( generalId )
				.catch( () => null )
			if ( !channel || channel.type !== 'GUILD_TEXT' || oldMember.guild.id !== channel.guildId ) return
			await channel.send( `¡Hola, <@!${ oldMember.user.id }>!` )
		}
	}
}
