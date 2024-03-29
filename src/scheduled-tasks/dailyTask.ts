import type { PieceContext } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import auditANDRoles from '../actions/Role/auditAndRoles';
import { archiveStudents } from '../actions/RStudent/Subactions/rArchive';

export class EventCreateTask extends ScheduledTask {
	public constructor(context: PieceContext) {
		super(context, {
			cron: '0 0 * * *',
			name: 'DailyTask'
		});
	}

	public async run() {
		await auditANDRoles();
		await archiveStudents();
	}
}

declare module '@sapphire/framework' {
	interface ScheduledTasks {
		daily: never;
	}
}
