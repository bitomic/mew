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

		await message.edit( {
			components: [],
			content: `Este ${ type } ya no está disponible.`,
			embeds: message.embeds.map( i => {
				i.color = Colors.amber.s800
				return i
			} )
		} )
		if ( message.hasThread ) {
			await message.thread?.setLocked( true )
			await message.thread?.setArchived( true )
		}

		void interaction.editReply( {
			embeds: [ {
				color: Colors.teal.s800,
				description: `He cerrado el ${ type }.`
			} ]
		} )
	}
}
