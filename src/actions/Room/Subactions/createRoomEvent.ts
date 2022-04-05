import type { ButtonInteraction, GuildScheduledEventCreateOptions, GuildScheduledEventEditOptions } from 'discord.js';
import type Room from '../Room';
import parseChannel from '../../Channel/parseChannel';
import { getGuildDocument } from '../../Guild/syncGuild';
import moment from 'moment';

const createRoomEvent = async (room: Room, interaction: ButtonInteraction & any) => {
	await interaction.deferReply({ ephemeral: true });
	const name = interaction.getTextInputValue(`name`);
	const startTime = interaction.getTextInputValue(`startTime`);
	const desc = interaction.getTextInputValue(`desc`);
	const [_guild, guild] = await getGuildDocument(room.guildId);

	if (_guild && room.channelId) {
		const [voiceChannel] = await parseChannel(guild, room.channelId);
		if (voiceChannel?.isVoice()) {
			const options: GuildScheduledEventEditOptions<any, any> = {
				name,
				entityType: 'VOICE',
				privacyLevel: 'GUILD_ONLY',
				description: desc,
				channel: voiceChannel
			};
			if (startTime) {
				options.scheduledStartTime = moment(startTime, ['MM/DD/YYYY h:mm A'], true).valueOf();
			}

			if (room.eventId) {
				const event = await guild.scheduledEvents.fetch(room.eventId);
				event.setStatus('ACTIVE');
				await event.edit(options);
			} else {
				const event = await guild.scheduledEvents.create(options as GuildScheduledEventCreateOptions);
				room._document.eventId = event.id;
			}
		}
	}
	await room._document.save();

	await interaction.followUp({ content: `Executed successfully`, ephemeral: true });
};

export default createRoomEvent;
