import type { VoiceState } from 'discord.js';
import RoomModel from '../../schemas/Room';
import parseChannel from '../Channel/parseChannel';
import { getGuildDocument } from '../Guild/syncGuild';
import Room from './Room';

const voiceGenerator = async (oldState: VoiceState, newState: VoiceState) => {
	const oldChannel = oldState.channel;
	const { guild, channel, id } = newState;
	const [_guild] = await getGuildDocument(guild);

	if (_guild) {
		if (channel) {
			if (_guild.channels.generator && _guild.channels.generator === channel.id) {
				const [generatorChannel] = await parseChannel(guild, _guild.channels.generator);
				const { index, defaultName, defaultEmoji } = _guild.generatorConfig;
				const name = `${defaultName} ${index + 1}`;
				if (generatorChannel?.parent?.id) {
					const channel = await guild.channels.create(`${defaultEmoji}${_guild.seperators.channel}${name}`, {
						parent: generatorChannel?.parent?.id,
						type: 'GUILD_VOICE'
					});

					const _room = await RoomModel.create({
						emoji: defaultEmoji,
						channelId: channel.id,
						guildId: _guild.guildId,
						name,
						index,
						createdTimestamp: channel.createdTimestamp,
						createdByEvent: false,
						host: id
					});

					await newState.setChannel(channel);
					await _room.save();
				}
			}

			const _room = await RoomModel.findOne({ channelId: channel.id });
			if (_room && !_room.cohost && _room.host !== id) {
				_room.cohost = id;
				const room = new Room(_room);
				room.updatecontroller(channel);
				await _room.save();
			}

			if (_room && _room.channelId) {
				const room = new Room(_room);
				const [channel] = await parseChannel(guild, _room.channelId);
				if (channel?.isVoice()) {
					channel.permissionOverwrites.edit(id, { VIEW_CHANNEL: true, CONNECT: true });
					room.updatecontroller(channel);
				}
			}
		} else if (oldChannel && oldChannel.id !== _guild.channels.generator && oldChannel?.members.size < 1) {
			const _room = await RoomModel.findOne({ channelId: oldChannel.id });
			if (!_room?.createdByEvent || Date.now() - (_room?.createdTimestamp ?? 0) > 1800000) {
				if (_room) {
					const room = new Room(_room);
					room.deleteController();
				}

				if (oldChannel.deletable) {
					await oldChannel.delete();
				}
			}
		} else if (oldChannel) {
			const _room = await RoomModel.findOne({ channelId: oldChannel.id });

			if (_room && _room.host === id) {
				const oldHost = _room?.host;
				if (_room.cohost) {
					const otherMembers = oldChannel.members.filter((member) => member.id !== _room.cohost && member.id !== _room.host);
					_room.host = _room.cohost;
					_room.cohost = otherMembers.firstKey();
				} else {
					const otherMembers = oldChannel.members.filter((member) => member.id !== _room.host);
					if (otherMembers.size) {
						const hosts = otherMembers.firstKey(2);
						_room.host = hosts[0];
						if (hosts[1]) {
							_room.cohost = hosts[1];
						}
					}
				}
				const room = new Room(_room);
				room.updatecontroller(oldChannel, oldHost);
				await _room.save();
			}

			if (_room && _room.cohost === id) {
				const otherMembers = oldChannel.members.filter((member) => member.id !== _room.cohost && member.id !== _room.host);
				_room.cohost = otherMembers.firstKey();
				const room = new Room(_room);
				room.updatecontroller(oldChannel);
				await _room.save();
			}

			if (_room && _room.channelId) {
				const [channel] = await parseChannel(guild, _room.channelId);
				if (channel?.isVoice()) {
					channel.permissionOverwrites.delete(id);
				}
			}
		}
	}
};

export default voiceGenerator;
