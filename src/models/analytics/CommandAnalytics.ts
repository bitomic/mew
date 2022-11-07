import { DataTypes, type ModelStatic, type Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { Model } from '../../framework'

interface ICommandAnalytic {
	action: 'run' | 'success' | 'error' | 'finished' | 'denied' | 'accepted'
	channel: string
	command: string
	time: Date
	user: string
}

interface ICommandAnalyticInterface extends SequelizeModel<ICommandAnalytic, ICommandAnalytic>, ICommandAnalytic {
}

export class CommandAnalyticModel extends Model<ICommandAnalyticInterface> {
	public readonly model: ModelStatic<ICommandAnalyticInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'command-analytics'
		} )

		this.model = this.container.sequelize.define<ICommandAnalyticInterface>(
			'CommandAnalytic',
			{
				action: DataTypes.STRING,
				channel: DataTypes.STRING,
				command: DataTypes.STRING,
				time: DataTypes.DATE,
				user: DataTypes.STRING
			},
			{
				tableName: 'CommandAnalytics',
				timestamps: false
			}
		)
	}

	public async register( command: string, action: ICommandAnalytic[ 'action' ], channel: string, user: string ) {
		await this.model.create( {
			action,
			channel,
			command,
			time: new Date(),
			user
		} )
	}
}

declare global {
	interface ModelRegistryEntries {
		'command-analytics': CommandAnalyticModel
	}
}
