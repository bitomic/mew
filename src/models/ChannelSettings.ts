import type { ModelStatic, Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { DataTypes } from 'sequelize'
import { Model } from '../framework'

interface IChannelSetting {
	channel: string
	setting: string
	value: string
}

interface IChannelSettingInterface extends SequelizeModel<IChannelSetting, IChannelSetting>, IChannelSetting {
}

export class ChannelSettingModel extends Model<IChannelSettingInterface> {
	public readonly model: ModelStatic<IChannelSettingInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'channel-settings'
		} )

		this.model = this.container.sequelize.define<IChannelSettingInterface>(
			'ChannelSetting',
			{
				channel: {
					primaryKey: true,
					type: DataTypes.STRING
				},
				setting: DataTypes.STRING,
				value: DataTypes.STRING
			},
			{
				tableName: 'ChannelSettings',
				timestamps: false
			}
		)
	}

	public async find( setting: string, value: string ): Promise<string | null> {
		const cache = this.container.cache.channels ?? {}
		for ( const [ channelId, channelCache ] of Object.entries( cache ) ) {
			if ( channelCache[ setting ] === value ) return channelId
		}

		const channel = ( await this.model.findOne( {
			where: { setting, value }
		} ) )?.getDataValue( 'channel' ) ?? null
		return channel
	}

	public async set( channel: string, setting: string, value: string ): Promise<void> {
		await this.model.upsert( { channel, setting, value } )
		this.setCache( channel, setting, value )
	}

	public setCache( channel: string, setting: string, value: string | null ): void {
		const channels = this.container.cache.channels ?? {}
		const channelData = channels[ channel ] ?? {}
		channels[ channel ] ??= channelData
		channelData[ setting ] = value
	}

	public async get( channel: string, setting: string ): Promise<string | null> {
		const cacheValue = this.container.cache.channels?.[ channel ]?.[ setting ]
		if ( cacheValue !== undefined ) {
			return cacheValue
		}

		const value = ( await this.model.findOne( {
			where: { channel, setting }
		} ) )?.getDataValue( 'value' ) ?? null
		this.setCache( channel, setting, value )

		return value
	}
}

declare global {
	interface ModelRegistryEntries {
		'channel-settings': ChannelSettingModel
	}
}
