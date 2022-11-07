import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks'

@ApplyOptions<ListenerOptions>( {
	event: ScheduledTaskEvents.ScheduledTaskRun
} )
export class UserEvent extends Listener {
	public async run( task: string, payload: unknown ): Promise<void> {
		await this.container.ready()
		void this.container.stores.get( 'models' ).get( 'task-analytics' )
			.register( task, 'run', payload )
	}
}
