import type { ListenerOptions, PieceContext } from '@sapphire/framework';
import { Listener, Store } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import type { GuildScheduledEventCreateOptions } from 'discord.js';
import moment from 'moment';
import parsePlaceholder from '../actions/General/parsePlaceholder';
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
			scheduledStartTimestamp: { $lte: moment().add(12, 'hours').valueOf() }
		});

		try {
			for (const _event of _events) {
				const [_guild, guild] = await getGuildDocument(_event.guildId);
				const options: GuildScheduledEventCreateOptions = {
					entityType: _event.entityType,
					name: await parsePlaceholder(`${_event.name}`),
					privacyLevel: _event.privacyLevel,
					scheduledStartTime: moment(_event.scheduledStartTimestamp).valueOf(),
					description: await parsePlaceholder(`${_event.description}`)
				};

				if (_event.channelId && _event.entityType !== 'EXTERNAL') {
					options.channel = _event.channelId;
				}
				if (_event.location && _event.entityType === 'EXTERNAL') {
					options.entityMetadata = {
						location: `${_event.location}`
					};
				}

				if (_event.scheduledEndTimestamp) {
					options.scheduledEndTime = moment(_event.scheduledEndTimestamp).valueOf();
				}

				await guild.scheduledEvents.create(options);

				if (_event.repeat) {
					_event.scheduledStartTimestamp = moment(_event.scheduledStartTimestamp).add(1, _event.repeat).valueOf();
					if (_event.scheduledEndTimestamp) {
						_event.scheduledEndTimestamp = moment(_event.scheduledEndTimestamp).add(1, _event.repeat).valueOf();
					}

					await _event.save();
				} else {
					await _event.delete();
				}
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
