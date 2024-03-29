import type { VoiceState } from 'discord.js';
import RoomModel from '../../schemas/Room';
import parseChannel from '../Channel/parseChannel';
import { getGuildDocument } from '../Guild/syncGuild';
import parseMember from '../Member/parseMember';
import Room from './Room';

const voiceGenerator = async (oldState: VoiceState, newState: VoiceState) => {
	const oldChannel = oldState.channel;
	const { guild, channel, id } = newState;
	const [_guild] = await getGuildDocument(guild);

	if (channel && oldChannel && oldChannel.id === channel.id) {
		return;
	}
	if (_guild) {
		if (channel && _guild.channels.generator && _guild.channels.generator === channel.id) {
			const [generatorChannel] = await parseChannel(guild, _guild.channels.generator);
			const { index, defaultName, defaultEmoji } = _guild.generatorConfig;
			let name = `${defaultName}`;
			let emoji = `${defaultEmoji}`;

			if (_guild.generatorConfig.names && _guild.generatorConfig.names.length) {
				const generatorName = _guild.generatorConfig.names[Math.floor(Math.random() * _guild.generatorConfig.names.length)];
				name = generatorName.name;
				emoji = generatorName.emoji;
			}
			if (generatorChannel?.parent?.id) {
				const channel = await guild.channels.create(`${emoji}${_guild.seperators.channel}${name}`, {
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
				_guild.generatorConfig.index += 1;
				await _guild.save();

				await newState.setChannel(channel);
				await _room.save();

				const [parsedMember] = await parseMember(guild, id);
				if (parsedMember) {
					const cachedRoles = Array.from(parsedMember.roles.cache.keys());
					let index = -1;
					_guild.generatorConfig.roles.forEach((roleId, i) => {
						if (cachedRoles.includes(roleId)) {
							index = i;
						}
					});
					const limit = Math.pow(2, index + 1) + 1;
					await channel.setUserLimit(limit < 100 ? limit : 99);
				}
			}
		} else if (channel) {
			const _room = await RoomModel.findOne({ channelId: channel.id });
			if (_room && !_room.cohost && _room.host !== id) {
				try {
					_room.cohost = id;
				} catch (error) {
					console.log(error);
				}
			}

			if (_room && _room.channelId) {
				try {
					const [channel] = await parseChannel(guild, _room.channelId);
					if (channel?.isVoice()) {
						channel.permissionOverwrites.edit(id, { VIEW_CHANNEL: true, CONNECT: true });
					}
				} catch (error) {
					console.log(error);
				}
			}

			if (_room && _room.threadId) {
				try {
					const [channel] = await parseChannel(guild, _guild.channels.threads);
					if (channel?.isText()) {
						const thread = await channel.threads.fetch(_room.threadId);
						if (thread) {
							await thread.setArchived(false);
							await thread.members.add(id);
						}
					}
				} catch (error) {
					console.log(error);
				}
			}
			if (_room) {
				const room = new Room(_room);
				room.updatecontroller(channel);
			}
		}

		if (oldChannel && oldChannel.id !== _guild.channels.generator && oldChannel.id !== _guild.channels.stage && oldChannel?.members.size < 1) {
			const _room = await RoomModel.findOne({ channelId: oldChannel.id });
			if (!_room?.createdByEvent || Date.now() - (_room?.createdTimestamp ?? 0) > 1800000) {
				if (_room) {
					const room = new Room(_room);
					room.deleteController();
				}

				if (oldChannel.deletable) {
					await oldChannel.delete();
					_guild.generatorConfig.index = _guild.generatorConfig.index ? _guild.generatorConfig.index - 1 : 0;
					await _guild.save();
				}

				if (_room && _room.threadId) {
					try {
						const [channel] = await parseChannel(guild, _guild.channels.threads);
						if (channel?.isText()) {
							const thread = await channel.threads.fetch(_room.threadId);
							if (thread) {
								await thread.setArchived(true);
							}
						}
					} catch (error) {}
				}
			}
		} else if (oldChannel) {
			const _room = await RoomModel.findOne({ channelId: oldChannel.id });
			let oldHost: string | null = null;
			if (_room && _room.host === id) {
				oldHost = _room?.host;
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
			}

			if (_room && _room.cohost === id) {
				const otherMembers = oldChannel.members.filter((member) => member.id !== _room.cohost && member.id !== _room.host);
				_room.cohost = otherMembers.firstKey();
			}
			if (_room) {
				const room = new Room(_room);
				room.updatecontroller(oldChannel, oldHost ? oldHost : undefined);
			}

			if (_room && _room.channelId) {
				const [channel] = await parseChannel(guild, _room.channelId);
				if (channel?.isVoice()) {
					channel.permissionOverwrites.delete(id);
				}
			}

			if (_room && _room.threadId) {
				try {
					const [channel] = await parseChannel(guild, _guild.channels.threads);
					if (channel?.isText()) {
						const thread = await channel.threads.fetch(_room.threadId);
						if (thread) {
							await thread.setArchived(false);
							await thread.members.remove(id);
						}
					}
				} catch (error) {}
			}
		}
	}
};

export default voiceGenerator;
