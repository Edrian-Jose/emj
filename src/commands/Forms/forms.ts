import { channelMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import parseChannel from '../../actions/Channel/parseChannel';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import temporaryReply from '../../actions/Message/temporaryReply';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Toggle forms visibility',
	aliases: ['!']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const { guild, member } = message;
		if (guild) {
			const [_guild] = await getGuildDocument(guild);
			if (_guild && _guild.channels.apps) {
				const [channel] = await parseChannel(guild, _guild.channels.apps);
				if (channel?.isText() && member) {
					const permission = channel.permissionsFor(member);
					if (permission && permission.has('VIEW_CHANNEL')) {
						channel.permissionOverwrites.delete(member);
						return temporaryReply(
							message,
							`${channelMention(channel.id)} is now hidden for you, type and enter !! again to unhide it.`,
							true
						);
					} else {
						channel.permissionOverwrites.edit(member, { VIEW_CHANNEL: true });
						return temporaryReply(
							message,
							`${channelMention(channel.id)} is now visible for you, type and enter !! again to hide it.`,
							true
						);
					}
				}
			}
		}
	}
}
