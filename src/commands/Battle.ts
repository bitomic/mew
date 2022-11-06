import type { ApplicationCommandRegistry, CommandOptions } from '@sapphire/framework'
import { GuildMember, MessageActionRow, MessageButton } from 'discord.js'
import { ApplyOptions } from '@sapphire/decorators'
import { ChannelTypes } from '../utils'
import Colors from '@bitomic/material-colors'
import { Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'

@ApplyOptions<CommandOptions>( {
	description: 'Anuncia que buscas un combate Pokémon.',
	enabled: true,
	name: 'combate'
	} )
export class UserCommand extends Command {
	public override async registerApplicationCommands( registry: ApplicationCommandRegistry ): Promise<void> {
		registry.registerChatInputCommand(
			builder => builder
				.setName( this.name )
				.setDescription( this.description )
				.addStringOption( input => input
					.setName( 'juego' )
					.setDescription( 'Especifica en qué juego buscas combatir.' )
					.setRequired( true )
					.addChoices( ...[
						'Pokémon Showdown',
						'Pokémon Diamante Brillante/Perla Reluciente',
						'Pokémon Espada/Escudo'
					].map( i => ( { name: i, value: i } ) ) ) )
				.addStringOption( input => input
					.setName( 'formato' )
					.setDescription( 'Elige un formato específico' )
					.addChoices( ...[
						'Normales 3vs3',
						'Normales 4vs4',
						'Normales 6vs6',
						'Dobles 4vs4',
						'Dobles 6vs6',
						'Monotipo',
						'Otro'
					].map( i => ( { name: i, value: i } ) ) ) ),
			await this.container.stores.get( 'models' ).get( 'commands' )
				.getData( this.name )
		)
	}

	public override async chatInputRun( interaction: CommandInteraction ): Promise<void> {
		await interaction.deferReply( { ephemeral: true } )

		const game = interaction.options.getString( 'juego', true )
		const format = interaction.options.getString( 'formato' ) ?? 'Cualquiera'

		const models = this.container.stores.get( 'models' )
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

		const channel = await this.container.client.channels.fetch( channelId )
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
		await channel.send( {
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

		await interaction.editReply( {
			embeds: [ {
				color: Colors.teal.s800,
				description: 'He creado el anuncio exitosamente.'
			} ]
		} )
	}
}
