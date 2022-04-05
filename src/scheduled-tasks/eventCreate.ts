import type { PieceContext } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import moment from 'moment';
import { getGuildDocument } from '../actions/Guild/syncGuild';
import EventModel from '../schemas/Event';

export class EventCreateTask extends ScheduledTask {
	public constructor(context: PieceContext) {
		super(context, {
			interval: 120 * 1000, // 60 seconds,
			name: 'EventCreate'
		});
	}

	public async run() {
		const _events = await EventModel.find({
			createdTimestamp: { $exists: false },
			scheduledStartTimestamp: { $lte: moment().add(3, 'days').valueOf() }
		});
		try {
			for (const _event of _events) {
				const [_guild, guild] = await getGuildDocument(_event.guildId);
				const event = await guild.scheduledEvents.create({
					entityType: _event.entityType,
					name: _event.name,
					privacyLevel: _event.privacyLevel,
					scheduledStartTime: _event.scheduledStartTimestamp,
					channel: _event.channelId,
					description: _event.description,
					scheduledEndTime: _event.scheduledEndTimestamp
				});
				_event.eventId = event.id;
				_event.createdTimestamp = moment().valueOf();
				await _event.save();
			}
		} catch (error) {
			console.log(error);
		}

		this.container.logger.info(`${_events.length} events found`);
	}
}

declare module '@sapphire/framework' {
	interface ScheduledTasks {
		event: never;
	}
}
