import { ScheduledTask, type ScheduledTaskOptions } from '@sapphire/plugin-scheduled-tasks'
import { ApplyOptions } from '@sapphire/decorators'
import Colors from '@bitomic/material-colors'

@ApplyOptions<ScheduledTaskOptions>( {
	name: 'auto-verify'
} )
export class UserTask extends ScheduledTask {
	public async run( memberId: string ): Promise<void> {
		await this.container.ready()

		const guild = await this.container.client.guilds.fetch( '1038642068341403771' )
		const member = await guild.members.fetch( memberId ).catch( () => null )
		if ( !member ) return

		if ( member.roles.cache.has( '1038645565413658675' ) ) return
		await member.roles.add( '1038645565413658675' )

		this.container.client.emit( 'server-log', {
			embeds: [ {
				color: Colors.teal.s800,
				description: `<@!${ member.user.id }> (${ member.user.tag }) ha sido verificado automáticamente.`
			} ]
		} )
	}
}

