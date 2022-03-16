import type { ButtonInteraction, Message } from 'discord.js';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import { webhooks } from '../../../lib/constants';
import MemberModel from '../../../schemas/Member';
import RoleModel from '../../../schemas/Role';
import parseChannel from '../../Channel/parseChannel';
import getChannelWebhook from '../../Channel/Webhook/getChannelWebhook';
import parseMember from '../../Member/parseMember';
import temporaryMessage from '../../Message/temporaryMessage';
import Form from '../Strategies/Form';
import type { FormDocument } from './../../../schemas/Form';
const formActivate = async (_form: FormDocument, interaction: ButtonInteraction) => {
	//
	const messages: (Message | APIMessage)[] = [];
	const { guild } = interaction;
	if (!guild) {
		return;
	}
	const userIds: string[] = [];

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
		if (destination.type === 'USER_DM') {
			for (const id of destination.ids) {
				if (!userIds.includes(id)) {
					userIds.push(id);
				}
			}
		}
		if (destination.type === 'ROLE_DM') {
			for (const id of destination.ids) {
				const _role = await RoleModel.findOne({ roleId: id });
				const members = await MemberModel.find({ roles: { $all: [_role?._id] } });
				members.forEach((member) => {
					if (!userIds.includes(member.userId)) {
						userIds.push(member.userId);
					}
				});
			}
		}

		if (userIds.length) {
			const form = new Form(_form);
			for (const id of userIds) {
				const [member] = await parseMember(guild, id);
				const message = await member.send({
					embeds: [form.createEmbed(true)],
					components: form.createComponents('INSTANCE')
				});
				messages.push(message);
			}
		}
	}
	if (interaction.channel) {
		if (messages.length) {
			temporaryMessage(interaction.channel, `Your Form has been sent to ${messages.length} channel(s)`);
		} else {
			temporaryMessage(
				interaction.channel,
				`Form cannot activate. There might be a problem in our side or you just forgot to put the destination channels to your created form`
			);
		}
	}
};

export default formActivate;
