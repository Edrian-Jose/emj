import type { ButtonInteraction } from 'discord.js';
import Room from '../Room';
import bcrypt from 'bcrypt';
import parseChannel from '../../Channel/parseChannel';
const getEmojisFromString = require('get-emojis-from-string');
import parseMember from '../../Member/parseMember';
import { getGuildDocument } from '../../Guild/syncGuild';

const editRoom = async (room: Room, interaction: ButtonInteraction & any) => {
	await interaction.deferReply({ ephemeral: true });
	const name = interaction.getTextInputValue(`name`);
	const emoji = interaction.getTextInputValue(`emoji`);
	const desc = interaction.getTextInputValue(`desc`);
	const passcode = interaction.getTextInputValue(`passcode`);
	const cohost = interaction.getTextInputValue(`cohost`);

	if (name) {
		room._document.name = name;
	}
	if (emoji) {
		const emojis = getEmojisFromString(emoji, { onlyDefaultEmojis: true });
		if (emojis && emojis.length) {
			room._document.emoji = emojis[emojis.length - 1].name.toString();
		}
		if (room.threadId) {
			try {
				const [_guild, guild] = await getGuildDocument(room.guildId);
				if (_guild) {
					const [channel] = await parseChannel(guild, _guild.channels.threads);
					if (channel?.isText()) {
						const thread = await channel.threads.fetch(room.threadId);
						if (thread) {
							await thread.setName(
								`${emojis[emojis.length - 1].name.toString()}${_guild.seperators.channel}${room.threadName ?? room.name}`
							);
						}
					}
				}
			} catch (error) {}
		}
	}

	if (desc) {
		room._document.description = desc;
	}

	if (cohost) {
		try {
			const [member] = await parseMember(room.guildId, cohost);
			if (member) {
				room._document.cohost = member.id;
			}
		} catch (error) {}
	}

	if (passcode) {
		const hashedPasscode = await bcrypt.hash(passcode, 10);
		room._document.password = hashedPasscode;
		room._document.locked = true;
	}

	const _room = await room._document.save();
	room = new Room(_room);
	if (room.channelId) {
		const [channel] = await parseChannel(room.guildId, room.channelId);
		if (channel?.isVoice()) {
			await room.updatecontroller(channel);
			const [_guild] = await getGuildDocument(room.guildId);
			if (room.locked) {
				await channel.permissionOverwrites.edit(room.guildId, { CONNECT: false });
			}
			if (room.cohost) {
				await channel.permissionOverwrites.edit(room.cohost, { CONNECT: true, VIEW_CHANNEL: true });
			}

			if (_guild) {
				await channel.setName(`${room.emoji}${_guild.seperators.channel}${room.name}`);
			}
		}
	}
	await interaction.followUp({ content: `${room.name} has been successfully edited`, ephemeral: true });
};

export default editRoom;
