import type { ChannelDocument } from '../../schemas/Channel';

import type { Guild, GuildBasedChannel, NonThreadGuildBasedChannel, Snowflake } from 'discord.js';
import ChannelModel from '../../schemas/Channel';
import parseGuild from '../Guild/parseGuild';
import isThread from '../Thread/isThread';
import parseChannel from './parseChannel';

const syncChannel = async (
	guildResolvable: Snowflake | Guild,
	channelResolvable: NonThreadGuildBasedChannel
): Promise<[(ChannelDocument & { _id: any }) | null, NonThreadGuildBasedChannel | null, Guild]> => {
	const [channel, guild] = await parseChannel(guildResolvable, channelResolvable);

	if (channel) {
		let _channel = await ChannelModel.findOne({ channelId: channel.id, guildId: guild.id }).exec();
		if (!_channel) {
			_channel = await ChannelModel.create({
				guildId: guild.id,
				channelId: channel.id
			});
		}

		_channel.type = channel.type;
		_channel.name = channel.name;
		_channel = await _channel.save();
		return [_channel, channel, guild];
	}
	return [null, channel, guild];
};

export const syncChannels = async (
	guildResolvable: Snowflake | Guild,
	channels: IterableIterator<GuildBasedChannel>
): Promise<[Array<ChannelDocument & { _id: any }>, NonThreadGuildBasedChannel[]]> => {
	const _channels: Array<ChannelDocument & { _id: any }> = [];
	const parsedChannels: NonThreadGuildBasedChannel[] = [];
	const guild = await parseGuild(guildResolvable);
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
	return [_channels, parsedChannels];
};

export default syncChannel;
