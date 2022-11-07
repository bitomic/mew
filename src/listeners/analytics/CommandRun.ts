import { type ChatInputCommand, Events, Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import type { CommandInteraction } from 'discord.js'

@ApplyOptions<ListenerOptions>( {
	event: Events.ChatInputCommandRun
} )
export class UserEvent extends Listener {
	public run( interaction: CommandInteraction, command: ChatInputCommand ): void {
		void this.container.stores.get( 'models' ).get( 'command-analytics' )
			.register( command.name, 'run', interaction.channelId, interaction.user.id )
	}
}
