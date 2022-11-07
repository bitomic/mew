import { Constants, type VoiceState } from 'discord.js'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '../utils'

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.VOICE_STATE_UPDATE
} )
export class UserEvent extends Listener {
	public async run( oldState: VoiceState, newState: VoiceState ): Promise<void> {
		if ( !oldState.channelId ) {
			await this.voiceChannelJoin( oldState, newState )
			return
		}
		if ( newState.channelId !== oldState.channelId ) {
			await this.voiceChannelLeft( oldState )
		}
	}

	protected async voiceChannelJoin( _: VoiceState, newState: VoiceState ): Promise<void> {
		const newRoomChannel = await this.container.stores.get( 'models' ).get( 'channel-settings' )
			.getSettingCache( 'type', ChannelTypes.NEW_VC )

		if ( !newState.channel ||  newState.channelId !== newRoomChannel ) return

		const index = newState.channel.parent?.children.filter( c => c.type === 'GUILD_VOICE' ).size ?? 0
		const vc = await newState.channel.parent?.createChannel( `Sala ${ index + 1 }`, {
			type: 'GUILD_VOICE',
			userLimit: 1
		} )
		if ( !vc ) return

		await newState.setChannel( vc )
	}

	protected async voiceChannelLeft( oldState: VoiceState ): Promise<void> {
		const newRoomChannel = await this.container.stores.get( 'models' ).get( 'channel-settings' )
			.getSettingCache( 'type', ChannelTypes.NEW_VC )
		if ( !newRoomChannel || oldState.channelId === newRoomChannel ) return

		const isInCategory = oldState.channel?.parent?.children.get( newRoomChannel )
		const hasHumanMembers = oldState.channel?.members.filter( u => !u.user.bot ).size

		if ( isInCategory && hasHumanMembers === 0 ) {
			await oldState.channel?.delete()
		}
	}
}
