import type { ButtonInteraction, GuildScheduledEventCreateOptions } from 'discord.js';
import type Room from '../Room';
import parseChannel from '../../Channel/parseChannel';
import { getGuildDocument } from '../../Guild/syncGuild';
import moment from 'moment';

const createRoomEvent = async (room: Room, interaction: ButtonInteraction & any) => {
	await interaction.deferReply({ ephemeral: true });
	const name = interaction.getTextInputValue(`name`);
	const startTime = interaction.getTextInputValue(`startTime`);
	const desc = interaction.getTextInputValue(`desc`);
	const scheduledStartTime = moment(startTime, ['MM/DD/YYYY h:mm A'], true);
	const [_guild, guild] = await getGuildDocument(room.guildId);

	if (_guild && room.channelId) {
		const [voiceChannel] = await parseChannel(guild, room.channelId);
		if (voiceChannel?.isVoice()) {
			const options: GuildScheduledEventCreateOptions = {
				name,
				entityType: 'VOICE',
				privacyLevel: 'GUILD_ONLY',
				scheduledStartTime: scheduledStartTime.valueOf(),
				description: desc,
				channel: voiceChannel
			};
			if (room.eventId) {
				const event = await guild.scheduledEvents.fetch(room.eventId);
				await event.edit(options);
			} else {
				const event = await guild.scheduledEvents.create(options);
				event.setStatus('ACTIVE');
				room._document.eventId = event.id;
			}
		}
	}
	await room._document.save();

	await interaction.followUp({ content: `${name} event has been successfully created`, ephemeral: true });
};

export default createRoomEvent;
