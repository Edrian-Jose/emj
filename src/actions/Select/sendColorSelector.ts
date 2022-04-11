import {
	MessageActionRow,
	MessageOptions,
	MessageSelectMenu,
	MessageSelectOptionData,
	NewsChannel,
	TextChannel,
	ThreadChannel,
	WebhookMessageOptions
} from 'discord.js';
import colorSelector from '../../components/embeds/color';
import randomHook from '../../lib/randomHook';
import getChannelWebhook from '../Channel/Webhook/getChannelWebhook';
import { getGuildDocument } from '../Guild/syncGuild';
import temporaryMessage from '../Message/temporaryMessage';
import parseRole from '../Role/parseRole';

const sendColorSelector = async (channel: TextChannel | NewsChannel | ThreadChannel) => {
	const { guild } = channel;

	const [_guild] = await getGuildDocument(guild);
	if (!_guild || !_guild.colorRoles) {
		await temporaryMessage(channel, `No color roles set in this server`);
		return false;
	}
	const colorOptions: MessageSelectOptionData[] = [];
	for (const id of _guild.colorRoles) {
		const [role] = await parseRole(guild, id);
		if (role) {
			colorOptions.push({
				label: role.name,
				value: role.id
			});
		}
	}

	let destination = channel;
	if (destination instanceof ThreadChannel) {
		if (destination.parent) {
			destination = destination.parent;
		}
	}
	const msgOptions = {
		embeds: [colorSelector()],
		components: [
			new MessageActionRow().addComponents(
				new MessageSelectMenu().setCustomId('___color').setPlaceholder('Pick a color').addOptions(colorOptions)
			)
		]
	} as MessageOptions;
	const webhook = await getChannelWebhook(destination as TextChannel, true);
	if (webhook) {
		const webhookOptions = msgOptions as WebhookMessageOptions;
		const hook = await randomHook();
		webhookOptions.username = hook.name;
		webhookOptions.avatarURL = hook.avatar;
		await webhook.send(webhookOptions);
	} else {
		await destination.send(msgOptions);
	}
	return true;
};

export default sendColorSelector;
