import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction, Message } from 'discord.js';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import WebhookModel from '../../schemas/Webhook';

export const data = new SlashCommandBuilder()
	.setName('delete-avatar')
	.setDescription('Delete a webhook avatar to be used by emj bot')
	.addUserOption((option) => option.setName('user').setDescription('User that will act as a webhook impersonation'))
	.addStringOption((option) => option.setName('name').setDescription('Name of the webhook'));

export const execute = async (interaction: CommandInteraction): Promise<APIMessage | Message> => {
	const user = interaction.options.getUser('user');
	const name = interaction.options.getString('name');

	await interaction.deferReply({ ephemeral: true });
	if (!interaction.channel) {
		return await interaction.followUp({ ephemeral: true, content: 'Use this command in a channel' });
	}

	const customId = user ? user.id : `${name}`;
	let _webhook = await WebhookModel.findOne({ customId }).exec();

	if (_webhook) {
		await _webhook.delete();
	} else {
		return await interaction.followUp({ ephemeral: true, content: 'No webhook avatar found with your supplied info' });
	}

	return await interaction.followUp({ ephemeral: true, content: 'Webhook avatar deleted successfully' });
};
