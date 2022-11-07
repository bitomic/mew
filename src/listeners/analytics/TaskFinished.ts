import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks'

@ApplyOptions<ListenerOptions>( {
	event: ScheduledTaskEvents.ScheduledTaskFinished
} )
export class UserEvent extends Listener {
	public run( task: string, payload: unknown ): void {
		void this.container.stores.get( 'models' ).get( 'task-analytics' )
			.register( task, 'finished', payload )
	}
}
