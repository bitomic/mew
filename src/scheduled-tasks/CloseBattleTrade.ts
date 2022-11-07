import { ScheduledTask, type ScheduledTaskOptions } from '@sapphire/plugin-scheduled-tasks'
import { ApplyOptions } from '@sapphire/decorators'
import Colors from '@bitomic/material-colors'

@ApplyOptions<ScheduledTaskOptions>( {
	name: 'close-battle-trade'
} )
export class UserTask extends ScheduledTask {
	public async run( payload: { channelId?: string, force?: boolean, messageId?: string, type?: string } ): Promise<void> {
		await this.container.ready()

		const { channelId, force = false, messageId, type } = payload
		if ( !channelId || !messageId || !type ) {
			this.container.logger.warn( 'Tried to run the close-battle-trade task with an incomplete payload.', payload )
			return
		}

		const channel = await this.container.client.channels.fetch( channelId )
			.catch( () => null )
		if ( !channel || channel.type !== 'GUILD_TEXT' ) return

		const message = await channel.messages.fetch( messageId )
			.catch( () => null )
		if ( !message || message.components.length === 0 ) return

		if ( !force && message.thread ) {
			const lastMessageTime = message.thread.lastMessage?.createdTimestamp

			// if there was a message in the last hour, don't close
			if ( lastMessageTime && lastMessageTime + 1000 * 60 * 60 > Date.now() ) {
				await this.container.tasks.create( 'close-battle-trade', payload, 1000 * 60 * 60 )
				return
			}
		}

		await message.edit( {
			components: [],
			content: `Este ${ type } ya no está disponible.`,
			embeds: message.embeds.map( i => {
				i.color = Colors.amber.s800
				return i
			} )
		} )

		if ( message.thread ) {
			await message.thread.send( {
				embeds: [ {
					color: Colors.teal.s800,
					description: `Este ${ type } ha sido cerrado automáticamente tras una hora de inactividad.`
				} ]
			} )
			await message.thread.edit( { archived: true, locked: true } )
		}
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		'close-battle-trade': never
	}
}
