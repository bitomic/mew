import { announceTrade, games } from '../../utils'
import { InteractionHandler, type InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import Colors from '@bitomic/material-colors'
import { type ModalSubmitInteraction } from 'discord.js'

@ApplyOptions<InteractionHandlerOptions>( {
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
} )
export class UserButton extends InteractionHandler {
	public override parse( interaction: ModalSubmitInteraction ) {
		if ( interaction.customId !== 'modal-trade' ) return this.none()
		return this.some()
	}

	public async run( interaction: ModalSubmitInteraction<'cached' | 'raw'> ) {
		await interaction.deferReply( { ephemeral: true } )

		const game = interaction.fields.getTextInputValue( 'game' )
		const type = interaction.fields.getTextInputValue( 'type' )
		const details = interaction.fields.getTextInputValue( 'details' )

		if ( !games.includes( game ) ) {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: `No reconozco el juego que escribiste: "${ game }".`
				} ]
			} )
			return
		}

		await announceTrade( interaction, game, type, details )
	}
}
