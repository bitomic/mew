import { DataTypes, type ModelStatic, type Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { Model } from '../framework'

interface IFanart {
	channel: string
	message: string
	reacts?: number
	user: string
}

interface IFanartInterface extends SequelizeModel<IFanart, IFanart>, IFanart {
}

export class FanartModel extends Model<IFanartInterface> {
	public readonly model: ModelStatic<IFanartInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'fanarts'
		} )

		this.model = this.container.sequelize.define<IFanartInterface>(
			'Fanart',
			{
				channel: DataTypes.STRING,
				message: {
					primaryKey: true,
					type: DataTypes.STRING
				},
				reacts: {
					defaultValue: 0,
					type: DataTypes.INTEGER
				},
				user: DataTypes.STRING
			},
			{
				tableName: 'Fanarts',
				timestamps: false
			}
		)
	}

	public async register( channel: string, message: string, user: string ): Promise<void> {
		await this.model.create( { channel, message, user } )
	}

	public async updateReacts( message: string, reacts: number ): Promise<void> {
		await this.model.update( { reacts }, {
			where: { message }
		} )
	}
}

declare global {
	interface ModelRegistryEntries {
		'fanarts': FanartModel
	}
}
