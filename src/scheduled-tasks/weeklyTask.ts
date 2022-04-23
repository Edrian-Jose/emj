import type { PieceContext } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { getNotifiableStudents } from '../actions/RStudent/Subactions/rArchive';

export class EventCreateTask extends ScheduledTask {
	public constructor(context: PieceContext) {
		super(context, {
			cron: '0 0 * * SUN',
			name: 'WeeklyTask'
		});
	}

	public async run() {
		await getNotifiableStudents();
	}
}

declare module '@sapphire/framework' {
	interface ScheduledTasks {
		weekly: never;
	}
}
