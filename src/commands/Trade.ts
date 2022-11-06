import type { ApplicationCommandRegistry, CommandOptions } from '@sapphire/framework'
import { Modal, TextInputComponent } from 'discord.js'
import { ApplyOptions } from '@sapphire/decorators'
import { Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'
import { games } from '../utils'

@ApplyOptions<CommandOptions>( {
	description: 'Anuncia que buscas un intercambio de Pokémon.',
	enabled: true,
	name: 'intercambiar'
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
					.addChoices( ...games.filter( i => !i.includes( 'Showdown' ) ).map( i => ( { name: i, value: i } ) ) ) )
				.addStringOption( input => input
					.setName( 'tipo' )
					.setDescription( 'Especifica el tipo de intercambio.' )
					.setRequired( true )
					.addChoices( ...[
						'Búsqueda',
						'Giveaway',
						'Registro para Pokédex (devolución)',
						'Intercambio sorpresa',
						'Otro'
					].map( i => ( { name: i, value: i } ) ) ) ),
			await this.container.stores.get( 'models' ).get( 'commands' )
				.getData( this.name )
		)
	}

	public override chatInputRun( interaction: CommandInteraction ): void {
		const game = interaction.options.getString( 'juego', true )
		const type = interaction.options.getString( 'tipo', true )

		const modal = new Modal()
			.setCustomId( 'modal-trade' )
			.setTitle( 'Detalles del intercambio' )
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
					components: [ new TextInputComponent()
						.setCustomId( 'type' )
						.setLabel( 'Tipo de intercambio' )
						.setRequired( true )
						.setStyle( 'SHORT' )
						.setValue( type )
						.toJSON() ],
					type: 'ACTION_ROW'
				},
				{
					components: [
						new TextInputComponent()
							.setCustomId( 'details' )
							.setLabel( 'Detalles adicionales' )
							.setPlaceholder( '¿Qué Pokémon buscas o estás dando?' )
							.setStyle( 'PARAGRAPH' )
							.setMaxLength( 1000 )
							.toJSON() ],
					type: 'ACTION_ROW'
				}
			)
		void interaction.showModal( modal )
	}
}
