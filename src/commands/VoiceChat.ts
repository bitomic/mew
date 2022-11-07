import { type ApplicationCommandRegistry, Command, type CommandOptions } from '@sapphire/framework'
import { type CommandInteraction, GuildMember } from 'discord.js'
import { ApplyOptions } from '@sapphire/decorators'
import Colors from '@bitomic/material-colors'
import { ChannelTypes } from '../utils'

@ApplyOptions<CommandOptions>( {
	description: 'Configura tu sala (canal de voz).',
	enabled: true,
	name: 'vc'
} )
export class UserCommand extends Command {
	public override async registerApplicationCommands( registry: ApplicationCommandRegistry ): Promise<void> {
		registry.registerChatInputCommand(
			builder => builder
				.setName( this.name )
				.setDescription( this.description )
				.addSubcommand( input => input
					.setName( 'nombre' )
					.setDescription( 'Cambia el nombre del canal' )
					.addStringOption( option => option
						.setName( 'nombre' )
						.setDescription( 'Nuevo nombre del canal' )
						.setMinLength( 1 )
						.setMaxLength( 100 )
						.setRequired( true ) ) )
				.addSubcommand( input => input
					.setName( 'límite' )
					.setDescription( 'Especifica el número máximo de miembros' )
					.addIntegerOption( option => option
						.setName( 'valor' )
						.setDescription( 'Límite de miembros (0 = sin límite)' )
						.setRequired( true )
						.setMinValue( 0 )
						.setMaxValue( 99 ) ) ),
			await this.container.stores.get( 'models' ).get( 'commands' )
				.getData( this.name )
		)
	}

	public override async chatInputRun( interaction: CommandInteraction<'cached' | 'raw'> ): Promise<void> {
		await interaction.deferReply( { ephemeral: true } )
		const subcommand = interaction.options.getSubcommand( true )

		const guild = interaction.guild ?? await this.container.client.guilds.fetch( interaction.guildId )
		const member = interaction.member instanceof GuildMember ? interaction.member : await guild.members.fetch( interaction.user.id )
		const vc = member.voice.channel

		if ( !vc ) {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: 'Este comando no puede ser usado si no estás en un canal de voz.'
				} ]
			} )
			return
		}

		const newRoomChannel = await this.container.stores.get( 'models' ).get( 'channel-settings' )
			.getSettingCache( 'type', ChannelTypes.NEW_VC )
		if ( !newRoomChannel || !vc.parent?.children.get( newRoomChannel ) ) {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: `Solo puedes configurar canales de voz que se encuentren en la misma categoría que <#${ newRoomChannel ?? '' }>.`
				} ]
			} )
			return
		}

		if ( subcommand === 'nombre' ) {
			const name = interaction.options.getString( 'nombre', true )
			void vc.setName( name )
		} else if ( subcommand === 'límite' ) {
			const max = interaction.options.getInteger( 'valor', true )
			void vc.edit( { userLimit: max } )
		} else {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.amber.s800,
					description: 'Raro, no conozco ese comando.'
				} ]
			} )
		}

		void interaction.editReply( {
			embeds: [ {
				color: Colors.teal.s800,
				description: '¡Entendido!'
			} ]
		} )
	}
}
