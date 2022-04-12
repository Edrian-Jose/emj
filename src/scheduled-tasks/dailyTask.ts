import type { PieceContext } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import auditANDRoles from '../actions/Role/auditAndRoles';

export class EventCreateTask extends ScheduledTask {
	public constructor(context: PieceContext) {
		super(context, {
			cron: '0 0 * * *',
			name: 'DailyTask'
		});
	}

	public async run() {
		await auditANDRoles();
	}
}

declare module '@sapphire/framework' {
	interface ScheduledTasks {
		daily: never;
	}
}
