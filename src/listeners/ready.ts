import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Listener, Store } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import moment from 'moment';
import { getGuildDocument } from '../actions/Guild/syncGuild';
import EventModel from '../schemas/Event';

const dev = process.env.NODE_ENV !== 'production';

export class UserEvent extends Listener {
	private readonly style = dev ? yellow : blue;

	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			once: true
		});
	}

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();

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
					scheduledStartTime: moment(_event.scheduledStartTimestamp).subtract(8, 'hours').valueOf(),
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
	}

	private printBanner() {
		const success = green('+');

		const llc = dev ? magentaBright : white;
		const blc = dev ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);

		console.log(
			String.raw`
${line01} ${pad}${blc('1.0.0')}
${line02} ${pad}[${success}] Gateway
${line03}${dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
