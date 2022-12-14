import { type ApplicationCommandRegistry, Command, type CommandOptions } from '@sapphire/framework'
import { type CommandInteraction, type GuildTextBasedChannel, Permissions } from 'discord.js'
import { ApplyOptions } from '@sapphire/decorators'
import { ChannelType } from 'discord-api-types/v10'
import { ChannelTypes } from '../../utils'
import { Colors } from '@bitomic/material-colors'

@ApplyOptions<CommandOptions>( {
	description: 'Define para qué se usa un canal.',
	enabled: true,
	name: 'tipo-del-canal'
} )
export class UserCommand extends Command {
	public override async registerApplicationCommands( registry: ApplicationCommandRegistry ): Promise<void> {
		registry.registerChatInputCommand(
			builder => builder
				.setName( this.name )
				.setDescription( this.description )
				.setDefaultMemberPermissions( Permissions.FLAGS.MANAGE_GUILD )
				.addChannelOption( input => input
					.setName( 'canal' )
					.setDescription( 'Canal a configurar' )
					.setRequired( true )
					.addChannelTypes( ChannelType.GuildText, ChannelType.GuildVoice ) )
				.addStringOption( input => input
					.setName( 'tipo' )
					.setDescription( 'Elige el tipo del canal.' )
					.setRequired( true )
					.addChoices(
						{ name: 'Combates', value: ChannelTypes.BATTLE },
						{ name: 'Fan-art', value: ChannelTypes.FANART },
						{ name: 'General', value: ChannelTypes.GENERAL },
						{ name: 'Intercambios', value: ChannelTypes.TRADE },
						{ name: 'Nuevo canal de voz', value: ChannelTypes.NEW_VC },
						{ name: 'Registros', value: ChannelTypes.LOGS },
						{ name: 'Starboard', value: ChannelTypes.STARBOARD }
					) ),
			await this.container.stores.get( 'models' ).get( 'commands' )
				.getData( this.name )
		)
	}

	public override async chatInputRun( interaction: CommandInteraction ): Promise<void> {
		await interaction.deferReply()

		const channel = interaction.options.getChannel( 'canal', true ) as GuildTextBasedChannel
		const type = interaction.options.getString( 'tipo', true )
		await this.container.stores.get( 'models' ).get( 'channel-settings' )
			.set( channel.id, 'type', type )

		void interaction.editReply( {
			embeds: [ {
				color: Colors.teal.s800,
				description: `Se ha configurado <#${ channel.id }> con el siguiente tipo: ${ type }.`
			} ]
		} )
		this.container.client.emit( 'server-log', {
			embeds: [ {
				color: Colors.teal.s800,
				description: `<@!${ interaction.user.id }> (${ interaction.user.tag }) ha configurado <#${ channel.id }> con el siguiente tipo: ${ type }.`
			} ]
		} )
	}
}
