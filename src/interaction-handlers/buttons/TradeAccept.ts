import { InteractionHandler, type InteractionHandlerOptions, InteractionHandlerTypes } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { type ButtonInteraction } from 'discord.js'
import Colors from '@bitomic/material-colors'
import type { Message } from 'discord.js'

@ApplyOptions<InteractionHandlerOptions>( {
	interactionHandlerType: InteractionHandlerTypes.Button
	} )
export class UserButton extends InteractionHandler {
	public override parse( interaction: ButtonInteraction ) {
		if ( interaction.customId !== 'trade-accept' ) return this.none()
		return this.some()
	}

	public async run( interaction: ButtonInteraction<'cached' | 'raw'> ) {
		await interaction.deferReply( { ephemeral: true } )
		if ( interaction.message.content.match( /\d+/ )?.at( 0 ) === interaction.user.id ) {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: 'No puedes aceptar tu propio intercambio.'
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

		let { thread } = message
		if ( !thread ) {
			thread = await message.startThread( {
				autoArchiveDuration: 'MAX',
				name: `Intercambio de ${ message.embeds.at( 0 )?.author?.name.split( '#' ).at( 0 ) ?? 'alguien' }`
			} )
		}

		const isInThread = await thread.members.fetch( interaction.user.id )
			.catch( () => null )
		if ( isInThread ) {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.amber.s800,
					description: `Ya te encuentras en la sala de este intercambio: <#${ thread.id }>.`
				} ]
			} )
			return
		}

		await thread.send( {
			content: `${ message.content } y <@!${ interaction.user.id }>`,
			embeds: [ {
				color: Colors.green.s800,
				description: 'Alguien ha aceptado el intercambio.'
			} ]
		} )
		void interaction.editReply( {
			embeds: [ {
				color: Colors.teal.s800,
				description: `Acabo de anunciar tu interés en el intercambio en <#${ thread.id }>, ¡buena suerte!`
			} ]
		} )
	}
}
