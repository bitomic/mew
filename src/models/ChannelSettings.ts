import { DataTypes, type ModelStatic, type Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
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
				channel: DataTypes.STRING,
				setting: {
					primaryKey: true,
					type: DataTypes.STRING
				},
				value: {
					primaryKey: true,
					type: DataTypes.STRING
				}
			},
			{
				tableName: 'ChannelSettings',
				timestamps: false
			}
		)
	}

	public async getChannelCache( channel: string, setting: string ): Promise<string | null> {
		const cached = await this.container.redis.get( `cs-${ channel }:${ setting }` )
		return cached ?? null
	}

	public async getSettingCache( setting: string, value: string ): Promise<string | null> {
		const cached = await this.container.redis.get( `cs-${ setting }:${ value }` )
		return cached ?? null
	}

	public async setCache( channel: string, setting: string, value: string ): Promise<void> {
		await this.container.redis.set( `cs-${ channel }:${ setting }`, value )
		await this.container.redis.set( `cs-${ setting }:${ value }`, channel )
	}

	public async find( setting: string, value: string ): Promise<string | null> {
		const cached = await this.getSettingCache( setting, value )
		if ( cached ) return cached

		const channel = ( await this.model.findOne( {
			where: { setting, value }
		} ) )?.getDataValue( 'channel' ) ?? null
		if ( channel ) await this.setCache( channel, setting, value )
		return channel
	}

	public async set( channel: string, setting: string, value: string ): Promise<void> {
		await this.model.upsert( { channel, setting, value } )
		await this.setCache( channel, setting, value )
	}

	public async get( channel: string, setting: string ): Promise<string | null> {
		const cached = await this.getChannelCache( channel, setting )
		if ( cached ) return cached

		const value = ( await this.model.findOne( {
			where: { channel, setting }
		} ) )?.getDataValue( 'value' ) ?? null
		if ( value ) await this.setCache( channel, setting, value )

		return value
	}
}

declare global {
	interface ModelRegistryEntries {
		'channel-settings': ChannelSettingModel
	}
}
