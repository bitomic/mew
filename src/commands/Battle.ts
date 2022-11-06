import type { ApplicationCommandRegistry, CommandOptions } from '@sapphire/framework'
import { Modal, TextInputComponent } from 'discord.js'
import { announceBattle } from '../utils'
import { ApplyOptions } from '@sapphire/decorators'
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
		const game = interaction.options.getString( 'juego', true )
		const format = interaction.options.getString( 'formato' ) ?? 'Cualquiera'

		if ( format !== 'Otro' ) {
			await interaction.deferReply( { ephemeral: true } )
			await announceBattle( interaction, game, format )
			return
		}

		const modal = new Modal()
			.setCustomId( 'modal-battle' )
			.setTitle( 'Detalles del combate' )
			.addComponents(
				{
					components: [ new TextInputComponent()
						.setCustomId( 'game' )
						.setLabel( 'Juego (no cambiar)' )
						.setRequired( true )
						.setStyle( 'SHORT' )
						.setValue( game )
						.toJSON() ],
					type: 'ACTION_ROW'
				},
				{
					components: [
						new TextInputComponent()
							.setCustomId( 'format' )
							.setLabel( 'Formato del combate' )
							.setPlaceholder( 'Random Monotype' )
							.setRequired( true )
							.setStyle( 'SHORT' )
							.setMinLength( 3 )
							.setMaxLength( 50 )
							.toJSON() ],
					type: 'ACTION_ROW'
				}
			)
		void interaction.showModal( modal )
	}
}
