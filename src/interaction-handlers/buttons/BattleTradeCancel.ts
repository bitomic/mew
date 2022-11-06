import { type ButtonInteraction, type Message } from 'discord.js'
import { InteractionHandler, type InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import Colors from '@bitomic/material-colors'

@ApplyOptions<InteractionHandlerOptions>( {
	interactionHandlerType: InteractionHandlerTypes.Button
} )
export class UserButton extends InteractionHandler {
	public override parse( interaction: ButtonInteraction ) {
		if ( interaction.customId !== 'battle-cancel' && interaction.customId !== 'trade-cancel' ) return this.none()
		return this.some()
	}

	public async run( interaction: ButtonInteraction<'cached' | 'raw'> ) {
		await interaction.deferReply( { ephemeral: true } )

		const type = interaction.customId.startsWith( 'battle' ) ? 'combate' : 'intercambio'
		if ( interaction.message.content.match( /\d+/ )?.at( 0 ) !== interaction.user.id ) {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: `No puedes cancelar los ${ type }s de otros jugadores.`
				} ]
			} )
			return
		}

		let message: Message<boolean>
		if ( 'edit' in interaction.message ) {
			message = interaction.message // eslint-disable-line prefer-destructuring
		} else {
			const msg = await interaction.channel?.messages.fetch( interaction.message.id )
				.catch( () => null )
			if ( !msg ) {
				void interaction.editReply( {
					embeds: [ {
						color: Colors.red.s800,
						description: 'No he podido recuperar el mensaje original.'
					} ]
				} )
				return
			}
			message = msg
		}

		const disabledComponents = message.components.map( row => {
			row.components.forEach( button => button.setDisabled( true ) )
			return row
		} )
		await message.edit( { components: disabledComponents } )

		void interaction.editReply( {
			embeds: [ {
				color: Colors.teal.s800,
				description: `El ${ type } debería de ser cerrado en un par de segundos.`
			} ]
		} )

		await this.container.tasks.create( 'close-battle-trade', {
			channelId: interaction.channelId,
			messageId: message.id,
			type
		}, 0 )
	}
}
