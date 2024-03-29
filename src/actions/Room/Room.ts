import { MessageActionRow, MessageButton, TextChannel, VoiceBasedChannel } from 'discord.js';
import room from '../../components/embeds/room';
import type { IRoom, RoomDocument } from '../../schemas/Room';
import RoomModel from '../../schemas/Room';
import parseChannel from '../Channel/parseChannel';
import getChannelWebhook from '../Channel/Webhook/getChannelWebhook';
import { getGuildDocument } from '../Guild/syncGuild';
import parseMember from '../Member/parseMember';

export type RoomSubActions =
	| 'lock'
	| 'hide'
	| 'thread'
	| 'event'
	| 'edit'
	| 'lockSubmit'
	| 'unlockSubmit'
	| 'enterSubmit'
	| 'editSubmit'
	| 'threadSubmit'
	| 'eventSubmit';
class Room implements IRoom {
	channelId?: string;
	_id: RoomDocument['_id'];
	_document: RoomDocument;
	guildId: string;
	description?: string;
	createdTimestamp: number;
	index: number;
	name: string;
	emoji: string;
	password?: string;
	hint?: string;
	locked?: boolean;
	hidden?: boolean;
	createdByEvent: boolean;
	host: string;
	cohost?: string;
	controllerMessage: string;
	threadId?: string;
	threadName?: string;
	eventId?: string;

	public constructor(document: RoomDocument) {
		this.channelId = document.channelId;
		this._id = document._id;
		this._document = document;
		this.guildId = document.guildId;
		this.description = document.description;
		this.createdTimestamp = document.createdTimestamp;
		this.index = document.createdTimestamp;
		this.name = document.name;
		this.emoji = document.emoji;
		this.password = document.password;
		this.hint = document.hint;
		this.locked = document.locked;
		this.hidden = document.hidden;
		this.createdByEvent = document.createdByEvent;
		this.host = document.host;
		this.cohost = document.cohost;
		this.controllerMessage = document.controllerMessage;
		this.threadId = document.threadId;
		this.threadName = document.threadName;
		this.eventId = document.eventId;
	}

	public createController(count?: number) {
		return room(this, count);
	}

	public getControls() {
		const actionRows: MessageActionRow[] = [];
		const lockButton = new MessageButton()
			.setEmoji(this.locked ? '➡️' : '🔒')
			.setCustomId(`___room-lock-${this._id}`)
			.setStyle('SECONDARY');
		const hideButton = new MessageButton()
			.setEmoji(this.hidden ? '👁️' : '👓')
			.setCustomId(`___room-hide-${this._id}`)
			.setStyle('SECONDARY');
		const threadButton = new MessageButton().setEmoji('#️⃣').setCustomId(`___room-thread-${this._id}`).setStyle('SECONDARY');
		const eventButton = new MessageButton().setEmoji('🗓️').setCustomId(`___room-event-${this._id}`).setStyle('SECONDARY');
		const editButton = new MessageButton().setEmoji('✍️').setCustomId(`___room-edit-${this._id}`).setStyle('SECONDARY');

		actionRows.push(new MessageActionRow().addComponents(lockButton, hideButton, editButton, threadButton, eventButton));

		return actionRows;
	}

	public async updatecontroller(voiceChannel: VoiceBasedChannel, oldHost?: string) {
		const [_guild, guild] = await getGuildDocument(this.guildId);
		const membersCount = voiceChannel?.members.size;
		if (_guild) {
			const roomsChannel = (await parseChannel(this.guildId, _guild.channels.rooms))[0] as TextChannel;
			if (roomsChannel) {
				const webhook = await getChannelWebhook(roomsChannel, true);
				const [member] = await parseMember(guild, this.host);
				if (webhook && member) {
					const msgOptions = {
						embeds: [await this.createController(membersCount)],
						components: this.getControls(),
						username: member.nickname ?? member.user.username ?? 'Unknown Host',
						avatarURL: member.displayAvatarURL()
					};
					if (oldHost && this.host !== oldHost) {
						if (this.controllerMessage) {
							await webhook.deleteMessage(this.controllerMessage);
						}

						const controllerMessage = await webhook.send(msgOptions);
						this._document.controllerMessage = controllerMessage.id;
					} else if (this.controllerMessage) {
						await webhook.editMessage(this.controllerMessage, msgOptions);
					} else {
						roomsChannel.permissionOverwrites.edit(this.guildId, { VIEW_CHANNEL: true });
						const controllerMessage = await webhook.send(msgOptions);
						this._document.controllerMessage = controllerMessage.id;
					}
					try {
						return await this._document.save();
					} catch (error) {
						console.log(error);
					}
				}
			}
		}
		return null;
	}

	public async deleteController() {
		const [_guild] = await getGuildDocument(this.guildId);
		if (_guild) {
			const roomsChannel = (await parseChannel(this.guildId, _guild.channels.rooms))[0] as TextChannel;
			if (roomsChannel) {
				const webhook = await getChannelWebhook(roomsChannel, true);
				try {
					if (webhook) {
						try {
							await this._document.delete();
						} catch (error) {
							console.log(error);
						} finally {
							try {
								await webhook.deleteMessage(this.controllerMessage);
							} catch (error) {
								console.log(error);
							}
						}
					}
				} catch (error) {
					console.log(error);
				} finally {
					const _room = await RoomModel.findOne().exec();
					if (!_room) {
						roomsChannel.permissionOverwrites.edit(this.guildId, { VIEW_CHANNEL: false });
					}
				}
			}
		}
	}
}

export default Room;
