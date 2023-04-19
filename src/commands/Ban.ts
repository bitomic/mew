import { type ApplicationCommandRegistry, Command, type CommandOptions } from '@sapphire/framework'
import { type CommandInteraction, MessageEmbed } from 'discord.js'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<CommandOptions>( {
	description: 'Banea a un miembro del servidor.',
	enabled: true,
	name: 'ban'
} )
export class UserCommand extends Command {
	public override async registerApplicationCommands( registry: ApplicationCommandRegistry ): Promise<void> {
		registry.registerChatInputCommand(
			builder => builder
				.setName( this.name )
				.setDescription( this.description )
				.addUserOption( input => input
					.setName( 'usuario' )
					.setDescription( 'Miembro a banear.' )
					.setRequired( true ) )
				.addStringOption( input => input
					.setName( 'motivo' )
					.setDescription( 'Motivo del baneo.' ) ),
			await this.container.stores.get( 'models' ).get( 'commands' )
				.getData( this.name )
		)
	}

	public override async chatInputRun( interaction: CommandInteraction<'cached'> ): Promise<void> {
		await interaction.deferReply()

		const user = interaction.options.getUser( 'usuario', true )
		const reason = interaction.options.getString( 'motivo' )
		const member = await interaction.guild.members.fetch( user ).catch( () => null )

		const embed = new MessageEmbed()
			.setTitle( `${ member?.nickname ?? user.username } ha recibido el rasho baneador` )
			.setDescription( `<@!${ user.id }> ha sido baneado por <@!${ interaction.user.id }>.` )
			.setThumbnail( member?.avatarURL( { format: 'png' } ) ?? '' )
			.setImage( 'https://i.imgur.com/oXyIqjL.jpg' )

		if ( reason ) {
			embed.addFields( {
				name: 'Motivo',
				value: reason
			} )
		}

		await interaction.editReply( {
			embeds: [ embed ]
		} )
	}
}
