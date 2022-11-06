import { type CommandInteraction, GuildMember, MessageActionRow, MessageButton, type ModalSubmitInteraction } from 'discord.js'
import { ChannelTypes } from '../constants'
import Colors from '@bitomic/material-colors'
import { container } from '@sapphire/pieces'

export const announceBattle = async ( interaction: CommandInteraction | ModalSubmitInteraction, game: string, format: string ): Promise<void> => {
	const models = container.stores.get( 'models' )
	const channelId = await models.get( 'channel-settings' ).find( 'type', ChannelTypes.BATTLE )
	if ( !channelId ) {
		void interaction.editReply( {
			embeds: [ {
				color: Colors.red.s800,
				description: 'Parece que el servidor no tiene configurado un canal para combates.'
			} ]
		} )
		return
	}

	const channel = await container.client.channels.fetch( channelId )
		.catch( () => null )
	if ( !channel || channel.type !== 'GUILD_TEXT' ) {
		void interaction.editReply( {
			embeds: [ {
				color: Colors.red.s800,
				description: 'He tenido un problema para encontrar el canal de combates.'
			} ]
		} )
		return
	}

	let color = 0x315068
	if ( game === 'Pokémon Diamante Brillante/Perla Reluciente' ) {
		color = 0x94a0fb
	} else if ( game === 'Pokémon Espada/Escudo' ) {
		color = 0x2e7d32
	}

	const nickname = ( interaction.member instanceof GuildMember ? interaction.member.nickname : interaction.user.username ) ?? interaction.user.username
	const message = await channel.send( {
		components: [ new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId( 'battle-accept' )
					.setLabel( 'Aceptar' )
					.setStyle( 'PRIMARY' ),
				new MessageButton()
					.setCustomId( 'battle-cancel' )
					.setLabel( 'Cancelar' )
					.setStyle( 'DANGER' )
			) ],
		content: `<@!${ interaction.user.id }>`,
		embeds: [ {
			author: {
				icon_url: interaction.user.avatarURL( { format: 'png' } ) ?? '',
				name: interaction.user.tag
			},
			color,
			description: `¡${ nickname } está buscando un combate! ¿Aceptas el desafío?`,
			fields: [
				{ inline: true, name: 'Juego', value: game },
				{ inline: true, name: 'Formato', value: format }
			],
			footer: {
				text: `ID de usuario: ${ interaction.user.id }`
			}
		} ]
	} )
	await container.tasks.create( 'close-battle-trade', {
		channelId,
		messageId: message.id,
		type: 'combate'
	}, 1000 * 60 * 60 )

	await interaction.editReply( {
		embeds: [ {
			color: Colors.teal.s800,
			description: 'He creado el anuncio exitosamente.'
		} ]
	} )
}
