import { SlashCommandBuilder, userMention } from '@discordjs/builders';
import type { CommandInteraction, Message, NewsChannel, TextChannel, WebhookMessageOptions } from 'discord.js';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import getChannelWebhook from '../../actions/Channel/Webhook/getChannelWebhook';
import parseMember from '../../actions/Member/parseMember';
import WebhookModel from '../../schemas/Webhook';

export const data = new SlashCommandBuilder()
	.setName('create-avatar')
	.setDescription('Create a webhook avatar to be used by emj bot')
	.addUserOption((option) => option.setName('user').setDescription('User that will act as a webhook impersonation'))
	.addStringOption((option) => option.setName('name').setDescription('Name of the webhook'))
	.addStringOption((option) => option.setName('avatar').setDescription('Avatar URL of the webhook'));

export const execute = async (interaction: CommandInteraction): Promise<APIMessage | Message> => {
	const user = interaction.options.getUser('user');
	const name = interaction.options.getString('name');
	const avatar = interaction.options.getString('avatar');
	let channel: TextChannel | NewsChannel | null = null;
	await interaction.deferReply({ ephemeral: true });
	if (!interaction.channel) {
		return await interaction.followUp({ ephemeral: true, content: 'Use this command in a channel' });
	}

	if (interaction.channel.isThread()) {
		channel = interaction.channel.parent;
	} else {
		channel = interaction.channel as TextChannel | NewsChannel;
	}
	const customId = user ? user.id : `${name}`;
	let _webhook = await WebhookModel.findOne({ customId }).exec();

	if (_webhook) {
		await _webhook.delete();
	}

	if (user) {
		if (!interaction.guild) {
			return await interaction.followUp({ ephemeral: true, content: 'You can only use this command in guilds' });
		}

		_webhook = await WebhookModel.create({
			isImpersonation: true,
			impersonation: { memberId: user.id, guildId: interaction.guild.id },
			customId: user.id
		});

		if (channel) {
			const webhook = await getChannelWebhook(channel, true);
			const [member] = await parseMember(_webhook.impersonation!.guildId, _webhook.impersonation!.memberId);
			if (webhook && member) {
				const options = {
					content: `>>> I will be ${
						member.displayName
					} webhook avatar from now on. Take notice that I have a tag of 'BOT' on my username so don't mistake as the real ${userMention(
						user.id
					)}`,
					username: member.displayName,
					avatarURL: member.displayAvatarURL()
				} as WebhookMessageOptions;
				if (interaction.channel.isThread()) {
					options.threadId = interaction.channel.id;
				}
				await webhook.send(options);
			}
		}
	} else {
		if (!avatar || !name) {
			return await interaction.followUp({ ephemeral: true, content: 'You must specifiy both name and avatar if no supplied user' });
		}
		_webhook = await WebhookModel.create({ username: name ? name : undefined, avatar: avatar ? avatar : undefined, customId: name });
		if (channel) {
			const webhook = await getChannelWebhook(channel, true);
			if (webhook) {
				const options = {
					content: `>>> Hi I'm a new webhook avatar`
				} as WebhookMessageOptions;

				if (_webhook.username) {
					options.username = _webhook.username;
				}
				if (_webhook.avatar) {
					options.avatarURL = _webhook.avatar;
				}

				if (interaction.channel.isThread()) {
					options.threadId = interaction.channel.id;
				}

				await webhook.send(options);
			}
		}
	}
	return await interaction.followUp({ ephemeral: true, content: 'Webhook avatar created successfully' });
};
