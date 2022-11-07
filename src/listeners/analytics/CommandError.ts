import { type ChatInputCommandAcceptedPayload, Events, Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ListenerOptions>( {
	event: Events.ChatInputCommandError
} )
export class UserEvent extends Listener {
	public async run( error: unknown, payload: ChatInputCommandAcceptedPayload ): Promise<void> {
		await this.container.ready()

		const { command, interaction } = payload

		this.container.logger.error( `An error occurred while processing task "${ command.name }".` )
		this.container.logger.error( error )

		void this.container.stores.get( 'models' ).get( 'command-analytics' )
			.register( command.name, 'error', interaction.channelId, interaction.user.id )
	}
}
