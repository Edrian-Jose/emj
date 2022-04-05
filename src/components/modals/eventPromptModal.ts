import type { GuildScheduledEvent } from 'discord.js';
import moment from 'moment';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import type Room from '../../actions/Room/Room';

const { Modal, TextInputComponent } = require('discord-modals');

const eventPromptModal = async (room: Room) => {
	let event: GuildScheduledEvent | null = null;
	const [_guild, guild] = await getGuildDocument(room.guildId);
	if (room.eventId && _guild) {
		event = await guild.scheduledEvents.fetch(room.eventId);
	}

	const name = new TextInputComponent()
		.setCustomId(`name`)
		.setLabel(`Event Name`)
		.setStyle('SHORT')
		.setRequired(true)
		.setDefaultValue(event ? event.name : room.name)
		.setPlaceholder(`Input the event name here....`);

	const time = new TextInputComponent()
		.setCustomId(`startTime`)
		.setLabel(`Datetime Start (MM/DD/YYYY h:mm A)`)
		.setStyle('SHORT')
		.setRequired(true)
		.setDefaultValue(moment().add(5, 'minutes').format('MM/DD/YYYY h:mm A'))
		.setPlaceholder(`e.g. 12/30/2000 1:16 AM`);

	const desc = new TextInputComponent()
		.setCustomId(`desc`)
		.setLabel(`Description`)
		.setStyle('LONG')
		.setRequired(false)
		.setDefaultValue((event ? event.description : room.description) ?? '')
		.setPlaceholder(`Event description goes here....`);

	const modal = new Modal() // We create a Modal
		.setCustomId(`___room-eventSubmit-${room._id}`)
		.setTitle(`Create Room Event`)
		.addComponents(name, desc);

	if (!event) {
		modal.addComponents(time);
	}

	return modal;
};

export default eventPromptModal;
