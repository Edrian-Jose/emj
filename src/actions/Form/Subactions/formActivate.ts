import type { ButtonInteraction, Message } from 'discord.js';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';
import MemberModel from '../../../schemas/Member';
import RoleModel from '../../../schemas/Role';
import parseChannel from '../../Channel/parseChannel';
import getChannelWebhook from '../../Channel/Webhook/getChannelWebhook';
import parseMember from '../../Member/parseMember';
import Form from '../Strategies/Form';
import type { FormDocument } from './../../../schemas/Form';
const formActivate = async (_form: FormDocument, interaction: ButtonInteraction) => {
	//
	const messages: (Message | APIMessage)[] = [];
	const { guild } = interaction;
	if (!guild) {
		return;
	}
	if (_form.creatorId !== interaction.user.id) {
		await interaction.followUp({
			content: `Only the admin or the form author can activate this form.`,
			ephemeral: true
		});
		return;
	}

	const userIds: string[] = [];

	for (const destination of _form.destination) {
		const form = new Form(_form);
		if (destination.type === 'GUILD_CHANNEL') {
			for (const id of destination.ids) {
				const [channel] = await parseChannel(guild, id);
				if (channel?.isText()) {
					const webhook = await getChannelWebhook(channel, true);
					const message = await webhook?.send({
						username: form.author.name,
						avatarURL: form.author.avatarURL,
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
				const _role = await RoleModel.findOne({ roleId: id, guildId: guild.id });
				const members = await MemberModel.find({ roles: { $all: [_role?._id] }, guildId: guild.id });
				members.forEach((member) => {
					if (!userIds.includes(member.userId)) {
						userIds.push(member.userId);
					}
				});
			}
		}

		if (userIds.length) {
			for (const id of userIds) {
				const [member] = await parseMember(guild, id);
				if (member) {
					const message = await member.send({
						embeds: [form.createEmbed(true)],
						components: form.createComponents('INSTANCE')
					});
					messages.push(message);
				}
			}
		}
	}
	if (interaction.channel) {
		if (messages.length) {
			await interaction.followUp({
				content: `Your Form has been sent to ${messages.length} channel(s)`,
				ephemeral: true
			});
		} else {
			await interaction.followUp({
				content: `Form cannot activate. There might be a problem in our side or you just forgot to put the destination channels to your created form`,
				ephemeral: true
			});
		}
	}
};

export default formActivate;
