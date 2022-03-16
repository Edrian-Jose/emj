import type { ButtonInteraction, Message } from 'discord.js';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import { webhooks } from '../../../lib/constants';
import parseChannel from '../../Channel/parseChannel';
import getChannelWebhook from '../../Channel/Webhook/getChannelWebhook';
import Form from '../Strategies/Form';
import type { FormDocument } from './../../../schemas/Form';
const formActivate = async (_form: FormDocument, interaction: ButtonInteraction) => {
	//
	const messages: (Message | APIMessage)[] = [];
	const { guild } = interaction;
	if (!guild) {
		return;
	}
	for (const destination of _form.destination) {
		if (destination.type === 'GUILD_CHANNEL') {
			const form = new Form(_form);
			for (const id of destination.ids) {
				const [channel] = await parseChannel(guild, id);
				if (channel?.isText()) {
					const webhook = await getChannelWebhook(channel, true);
					const randomWebhook = webhooks.random[Math.floor(Math.random() * webhooks.random.length)];
					const message = await webhook?.send({
						username: randomWebhook.name,
						avatarURL: randomWebhook.avatar,
						embeds: [form.createEmbed()],
						components: form.createComponents('INSTANCE')
					});
					if (message) {
						messages.push(message);
					}
				}
			}
		}
	}

	if (messages.length) {
		await interaction.reply({ content: `Your Form has been sent to ${messages.length} channel(s)`, ephemeral: true });
	} else {
		await interaction.reply({
			content: `Form cannot activate. There might be a problem in our side or you just forgot to put the destination channels to your created form`,
			ephemeral: true
		});
	}
};

export default formActivate;
