import { Constants, type GuildMember } from 'discord.js'
import { Listener, type ListenerOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.GUILD_MEMBER_ADD
} )
export class UserEvent extends Listener {
	public async run( member: GuildMember ): Promise<void> {
		await this.container.tasks.create( 'auto-verify', member.user.id, 1000 * 60 * 60 ) // 1 hour
	}
}
