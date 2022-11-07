import { DataTypes, type ModelStatic, type Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { Model } from '../../framework'

interface ITaskAnalytic {
	action: 'run' | 'success' | 'error' | 'finished'
	payload?: string | undefined
	task: string
	time: Date
}

interface ITaskAnalyticInterface extends SequelizeModel<ITaskAnalytic, ITaskAnalytic>, ITaskAnalytic {
}

export class TaskAnalyticModel extends Model<ITaskAnalyticInterface> {
	public readonly model: ModelStatic<ITaskAnalyticInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'task-analytics'
		} )

		this.model = this.container.sequelize.define<ITaskAnalyticInterface>(
			'TaskAnalytic',
			{
				action: DataTypes.STRING,
				payload: {
					allowNull: true,
					type: DataTypes.STRING
				},
				task: DataTypes.STRING,
				time: DataTypes.DATE
			},
			{
				tableName: 'TaskAnalytics',
				timestamps: false
			}
		)
	}

	public async register( task: string, action: ITaskAnalytic[ 'action' ], payload?: unknown ) {
		if ( payload && typeof payload === 'object' ) {
			payload = JSON.stringify( payload )
		} else {
			payload = undefined
		}
		await this.model.create( {
			action,
			payload: payload as string | undefined,
			task,
			time: new Date()
		} )
	}
}

declare global {
	interface ModelRegistryEntries {
		'task-analytics': TaskAnalyticModel
	}
}
