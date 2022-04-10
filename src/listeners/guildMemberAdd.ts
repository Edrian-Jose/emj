import { userMention } from '@discordjs/builders';
import { getGuildDocument } from './../actions/Guild/syncGuild';
import { getMemberDocument } from './../actions/Member/syncMember';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GuildMember, MessageActionRow, MessageButton, TextChannel } from 'discord.js';
import syncMember from '../actions/Member/syncMember';
import parseChannel from '../actions/Channel/parseChannel';
import getChannelWebhook from '../actions/Channel/Webhook/getChannelWebhook';
import welcome from '../components/embeds/welcome';
import randomHook from '../lib/randomHook';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		const [_member] = await getMemberDocument(member.guild, member);
		const [_newMember] = await syncMember(member.guild, member);
		const [_guild, guild] = await getGuildDocument(member.guild);

		if (_member && _member.nickname) {
			if (_member.manageable) {
				member = await member.setNickname(_member.nickname);
			}
		}
		if (_member && _member.roles && _member.roles.length) {
			member = await member.roles.add(_member.roles.map((role) => role.roleId));
		} else if (_guild) {
			if (_guild.join && _guild.join.roles) {
				member = await member.roles.add(_guild.join.roles);
			}

			if (_guild.channels.welcome && _guild.join.form) {
				const [welcomeChannel] = await parseChannel(guild, _guild.channels.welcome);
				const channel = welcomeChannel as TextChannel;
				const webhook = await getChannelWebhook(channel, true);
				const randomUser = await randomHook();
				if (webhook) {
					webhook.send({
						content: `Hi ${userMention(member.user.id)}`,
						embeds: [await welcome(member)],
						username: randomUser.name,
						avatarURL: randomUser.avatar,
						components: [
							new MessageActionRow().addComponents(
								new MessageButton().setCustomId(`___form-start-${_guild.join.form}`).setLabel('Join').setStyle('PRIMARY')
							)
						]
					});
				}
			}
		}
	}
}
