import type { ChannelDocument } from '../../schemas/Channel';
import type { Guild, GuildBasedChannel, NonThreadGuildBasedChannel, Snowflake } from 'discord.js';
import ChannelModel from '../../schemas/Channel';
import parseGuild from '../Guild/parseGuild';
import isThread from '../Thread/isThread';
import parseChannel from './parseChannel';
import type { BaseGuildTextChannel } from 'discord.js';
import { container } from '@sapphire/framework';
import { cleanThreads } from '../Thread/syncThread';
// import { cleanThreads } from '../Thread/syncThread';

export const getChannelDocument = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: Snowflake | NonThreadGuildBasedChannel
): Promise<[(ChannelDocument & { _id: any }) | null, NonThreadGuildBasedChannel | null, Guild]> => {
	let _channel: (ChannelDocument & { _id: any }) | null = null;
	const [channel, guild] = await parseChannel(guildResolvable, channelResolvable);
	const id = typeof channelResolvable === 'string' ? channelResolvable : channelResolvable.id;
	_channel = await ChannelModel.findOne({ channelId: id, guildId: guild.id }).exec();
	if (channel) {
		if (!_channel) {
			_channel = await ChannelModel.create({
				guildId: guild.id,
				channelId: channel.id
			});
		}
		return [_channel, channel, guild];
	} else if (_channel) {
		_channel = await _channel.delete();
	}

	return [_channel, channel, guild];
};

const syncChannel = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: NonThreadGuildBasedChannel | Snowflake
): Promise<[(ChannelDocument & { _id: any }) | null, NonThreadGuildBasedChannel | null, Guild]> => {
	let [_channel, channel, guild] = await getChannelDocument(guildResolvable, channelResolvable);

	if (channel && _channel) {
		if (['GUILD_NEWS', 'GUILD_TEXT'].includes(channel.type)) {
			const webhooks = await (channel as BaseGuildTextChannel).fetchWebhooks();
			webhooks.each((webhook) => {
				if (webhook.owner?.bot && webhook.owner.id === container.client.user?.id) {
					_channel!.webhookId = webhook.id;
				}
			});
		}

		_channel.type = channel.type;
		_channel.name = channel.name;
		try {
			_channel = await _channel.save();
		} catch (error) {
			console.log(error);
		}
	}
	return [_channel, channel, guild];
};

export const syncChannels = async (
	guildResolvable: Snowflake | Guild,
	channels?: IterableIterator<GuildBasedChannel>
): Promise<[Array<ChannelDocument & { _id: any }>, NonThreadGuildBasedChannel[]]> => {
	const _channels: Array<ChannelDocument & { _id: any }> = [];
	const parsedChannels: NonThreadGuildBasedChannel[] = [];
	const guild = await parseGuild(guildResolvable);
	if (guild && channels) {
		for (const channel of channels) {
			if (!isThread(channel.type)) {
				const [_channel, parsedChannel] = await syncChannel(guild, channel as NonThreadGuildBasedChannel);
				if (_channel) {
					_channels.push(_channel);
				}
				if (parsedChannel) {
					parsedChannels.push(parsedChannel);
				}
			}
		}
	} else {
		const id = typeof guildResolvable === 'string' ? guildResolvable : guildResolvable.id;
		await ChannelModel.deleteMany({ guildId: id }).exec();
	}

	return [_channels, parsedChannels];
};

export const cleanChannels = async (guildResolvable: Snowflake | Guild) => {
	const id = typeof guildResolvable === 'string' ? guildResolvable : guildResolvable.id;
	const _channels = await ChannelModel.find({ guildId: id }).exec();
	_channels.forEach(async (_channel) => {
		const [channel] = await parseChannel(guildResolvable, _channel.channelId);
		if (!channel) {
			await _channel.delete();
		}
		
		await cleanThreads(guildResolvable, _channel.channelId);
	});
};

export default syncChannel;
