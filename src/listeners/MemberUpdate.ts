import { Constants, type GuildMember } from 'discord.js'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.GUILD_MEMBER_UPDATE
} )
export class UserEvent extends Listener {
	public async run( oldMember: GuildMember, newMember: GuildMember ): Promise<void> {
		if ( oldMember.roles.cache.size === 0 && newMember.roles.cache.size > 0 ) {
			const channel = await this.container.client.channels.fetch( '1038642069528399884' )
				.catch( () => null )
			if ( !channel || channel.type !== 'GUILD_TEXT' ) return
			await channel.send( `¡Hola, <@!${ oldMember.user.id }>!` )
		}
	}
}
