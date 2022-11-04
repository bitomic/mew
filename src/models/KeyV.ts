import type { ModelStatic, Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { DataTypes } from 'sequelize'
import { Model } from '../framework'

interface IKeyV {
	key: string
	value: string
}

interface IKeyVInterface extends SequelizeModel<IKeyV, IKeyV>, IKeyV {
}

export class KeyVModel extends Model<IKeyVInterface> {
	public readonly model: ModelStatic<IKeyVInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'keyv'
		} )

		this.model = this.container.sequelize.define<IKeyVInterface>(
			'KeyV',
			{
				key: {
					primaryKey: true,
					type: DataTypes.STRING
				},
				value: {
					type: DataTypes.STRING
				}
			},
			{
				tableName: 'KeyV',
				timestamps: false
			}
		)
	}

	public async set( key: string, value: string ): Promise<void> {
		await this.container.redis.set( key, value )
		await this.model.upsert(
			{ key, value },
		)
	}

	public async get( key: string ): Promise<string | null> {
		const cached = await this.container.redis.get( key )
		if ( cached ) return cached

		const result = await this.model.findOne( { where: { key } } )
		if ( result ) await this.container.redis.set( key, result.value )
		return result?.getDataValue( 'value' ) ?? null
	}
}

declare global {
	interface ModelRegistryEntries {
		keyv: KeyVModel
	}
}
