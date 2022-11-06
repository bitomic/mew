import { DataTypes, type ModelStatic, type Model as SequelizeModel } from 'sequelize'
import { type Message, MessageActionRow, MessageButton } from 'discord.js'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { ChannelTypes } from '../utils'
import Colors from '@bitomic/material-colors'
import { env } from '../lib'
import Imgur from 'imgur'
import { Model } from '../framework'

interface IStarboardMessage {
	channel: string
	message: string
	pinnedMessage: string
	user: string
}

interface IStarboardMessageInterface extends SequelizeModel<IStarboardMessage, IStarboardMessage>, IStarboardMessage {
}

export class StarboardMessageModel extends Model<IStarboardMessageInterface> {
	public readonly model: ModelStatic<IStarboardMessageInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'starboard-messages'
		} )

		this.model = this.container.sequelize.define<IStarboardMessageInterface>(
			'StarboardMessage',
			{
				channel: DataTypes.STRING,
				message: {
					primaryKey: true,
					type: DataTypes.STRING
				},
				pinnedMessage: DataTypes.STRING,
				user: DataTypes.STRING
			},
			{
				tableName: 'StarboardMessages',
				timestamps: false
			}
		)
	}

	public async getPinnedMessage( message: string ): Promise<string | null> {
		const stored = await this.container.redis.get( `starboard-${ message }` )
		if ( stored ) return stored

		const result = ( await this.model.findOne( { where: { message } } ) )?.pinnedMessage ?? null
		if ( result ) await this.container.redis.set( `starboard-${ message }`, result )

		return result
	}

	public async has( message: string ): Promise<boolean> {
		const pin = await this.getPinnedMessage( message )
		return pin !== null
	}

	public async register( message: Message ): Promise<void> {
		if ( await this.has( message.id ) ) return

		const starboardId = await this.container.stores.get( 'models' ).get( 'channel-settings' )
			.find( 'type', ChannelTypes.STARBOARD )
		if ( !starboardId ) return
		const starboard = await this.container.client.channels.fetch( starboardId )
		if ( !starboard || starboard.type !== 'GUILD_TEXT' ) return

		const imgur = new Imgur( {
			clientId: env.IMGUR_CLIENT_ID,
			clientSecret: env.IMGUR_CLIENT_SECRET
		} )
		const image = await imgur.upload( { image: message.author.avatarURL( { format: 'png' } ) ?? '' } )
		const stars = message.reactions.resolve( '⭐' )?.count
		const pin = await starboard.send( {
			components: [ new MessageActionRow()
				.addComponents( new MessageButton()
					.setLabel( 'Ir al mensaje' )
					.setURL( message.url )
					.setStyle( 'LINK' ) ) ],
			content: `⭐ ${ stars ?? '¿?' }`,
			embeds: [ {
				author: {
					iconURL: image.data.link,
					name: message.author.tag
				},
				color: Colors.yellow.s800,
				description: message.content,
				footer: {
					text: `${ message.id } • #${ 'name' in message.channel ? message.channel.name : message.channel.id }`
				},
				image: {
					url: message.attachments.at( 0 )?.url ?? ''
				},
				timestamp: Date.now()
			}, ...message.embeds ]
		} )
			.catch( () => null )
		if ( !pin ) return
		await this.container.redis.set( `starboard-${ message.id }`, pin.id )

		await this.model.create( {
			channel: message.channelId,
			message: message.id,
			pinnedMessage: pin.id,
			user: message.author.id
		} )
	}
}

declare global {
	interface ModelRegistryEntries {
		'starboard-messages': StarboardMessageModel
	}
}
