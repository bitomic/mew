import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks'

@ApplyOptions<ListenerOptions>( {
	event: ScheduledTaskEvents.ScheduledTaskError
} )
export class UserEvent extends Listener {
	public run( error: unknown, task: string, payload: unknown ): void {
		this.container.logger.error( `An error occurred while processing task "${ task }".` )
		this.container.logger.error( error )
		void this.container.stores.get( 'models' ).get( 'task-analytics' )
			.register( task, 'error', payload )
	}
}
