import { Constants, type GuildMember } from 'discord.js'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '../utils'

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.GUILD_MEMBER_UPDATE
} )
export class UserEvent extends Listener {
	public async run( oldMember: GuildMember, newMember: GuildMember ): Promise<void> {
		const hadRole = oldMember.roles.resolve( '1038645565413658675' )
		const hasRole = newMember.roles.resolve( '1038645565413658675' )

		if ( !hadRole && hasRole && newMember.roles.cache.size === 2 ) { // @everyone and the role
			const generalId = await this.container.stores.get( 'models' ).get( 'channel-settings' )
				.getSettingCache( 'type', ChannelTypes.GENERAL )
			if ( !generalId ) return

			const channel = await this.container.client.channels.fetch( generalId )
				.catch( () => null )
			if ( !channel || channel.type !== 'GUILD_TEXT' || oldMember.guild.id !== channel.guildId ) return

			const emojis = [
				'<:CuteChick:1038965848414625852>',
				'<:Eevee_Cool:1038965126876897340>',
				'<:FlareonDab:1038675623830364230>',
				'<:Fuecoco:1038967087730790470>',
				'<:Furret_Excited:1038966139218317445>',
				'<:Jiggly_Wow:1038967590015471697>',
				'<a:LitwickDance:1039011768409796629>',
				'<:MewGiggle:1038965506830500032>',
				'<:Mudkip_Heart:1038965902533734490>',
				'<a:PikachuTossTogepi:1038965296918184006>',
				'<a:PurpleVulpix:1038966553779122206>',
				'<:LitwickOk:1039011765851263089>',
				'<:Quaxly:1038967063282204672>',
				'<:Shiny_Eevee:1038965101677527040>',
				'<a:SylveonKiss:1038964839164432495>',
				'<:TorchicLove:1038965878680719443>',
				'<a:Vulpat:1039011773908516864>',
				'<:mewhi:1041056366774718575>',
				'<a:furretwalk:1038966187712852099>',
				'<:pichuhi:1041056368095928350>',
				'<:pikachu_nom:1038967263270797378>',
				'<a:pikawave:1041056369693958174>',
				'<a:wiggly:1039011725917290557>'
			]
			const randomEmoji = emojis[ Math.floor( Math.random() * emojis.length ) ] ?? ''
			await channel.send( `¡Bienvenido, <@!${ newMember.user.id }>!
				Ten una linda estadía, no olvides pasarte por <#1038669139876790302>>, puede que consigas cosas que te interesen, pero más importante, pásala bien en esté maravilloso server ${ randomEmoji }` )
		}
	}
}
