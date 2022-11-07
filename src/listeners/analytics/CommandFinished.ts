import { type ChatInputCommand, Events, Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import type { CommandInteraction } from 'discord.js'

@ApplyOptions<ListenerOptions>( {
	event: Events.ChatInputCommandFinish
} )
export class UserEvent extends Listener {
	public async run( interaction: CommandInteraction, command: ChatInputCommand ): Promise<void> {
		await this.container.ready()

		void this.container.stores.get( 'models' ).get( 'command-analytics' )
			.register( command.name, 'finished', interaction.channelId, interaction.user.id )
	}
}
