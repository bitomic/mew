import { type ChatInputCommandAcceptedPayload, Events, Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ListenerOptions>( {
	event: Events.ChatInputCommandSuccess
} )
export class UserEvent extends Listener {
	public async run( payload: ChatInputCommandAcceptedPayload ): Promise<void> {
		await this.container.ready()
		const { command, interaction } = payload
		void this.container.stores.get( 'models' ).get( 'command-analytics' )
			.register( command.name, 'success', interaction.channelId, interaction.user.id )
	}
}
