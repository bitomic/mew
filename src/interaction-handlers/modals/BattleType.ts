import { announceBattle, games } from '../../utils'
import { InteractionHandler, type InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import Colors from '@bitomic/material-colors'
import { type ModalSubmitInteraction } from 'discord.js'

@ApplyOptions<InteractionHandlerOptions>( {
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
} )
export class UserButton extends InteractionHandler {
	public override parse( interaction: ModalSubmitInteraction ) {
		if ( interaction.customId !== 'modal-battle' ) return this.none()
		return this.some()
	}

	public async run( interaction: ModalSubmitInteraction<'cached' | 'raw'> ) {
		await interaction.deferReply( { ephemeral: true } )

		const game = interaction.fields.getTextInputValue( 'game' )
		const format = interaction.fields.getTextInputValue( 'format' )

		if ( !games.includes( game ) ) {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: `No reconozco el juego que escribiste: "${ game }".`
				} ]
			} )
			return
		}

		await announceBattle( interaction, game, format )
	}
}
