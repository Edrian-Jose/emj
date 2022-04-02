import type { ButtonInteraction, ThreadChannel } from 'discord.js';
import parseChannel from '../../Channel/parseChannel';
import type Room from '../Room';
import { getGuildDocument } from '../../Guild/syncGuild';

const createRoomThread = async (room: Room, interaction: ButtonInteraction & any) => {
	await interaction.deferReply({ ephemeral: true });
	const [_guild, guild] = await getGuildDocument(room.guildId);
	const name = interaction.getTextInputValue(`thread`);

	if (_guild && name && room.channelId) {
		const threadName = `${room.emoji}${_guild?.seperators.channel}${name}`;
		try {
			const [voiceChannel] = await parseChannel(guild, room.channelId);
			const [channel] = await parseChannel(guild, _guild.channels.threads);
			if (channel?.isText() && voiceChannel?.isVoice()) {
				let thread: ThreadChannel | null;

				if (room.threadId) {
					thread = await channel.threads.fetch(room.threadId);
				} else {
					thread = await channel.threads.create({ name: threadName, autoArchiveDuration: 1440 });
					for (const member of voiceChannel.members.values()) {
						await thread.members.add(member);
					}
				}
				if (thread) {
					thread = await thread.setName(threadName);
					if (thread.id !== room.threadId) {
						room._document.threadId = thread.id;
						await room._document.save();
					}
				}
			}
		} catch (error) {
			return await interaction.followUp({ content: `An error occured`, ephemeral: true });
		}
	}

	return await interaction.followUp({ content: `You can now join ${room.name}`, ephemeral: true });
};

export default createRoomThread;
