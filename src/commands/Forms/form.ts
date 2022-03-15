import { bold, inlineCode } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import parseChannel from '../../actions/Channel/parseChannel';
import registerForm from '../../actions/Form/registerForm';
import Form from '../../actions/Form/Strategies/Form';
import temporaryReply from '../../actions/Message/temporaryReply';
import type { Form as IForm } from '../../schemas/Form';
import GuildModel from '../../schemas/Guild';

@ApplyOptions<SubCommandPluginCommandOptions>({
	subCommands: ['upload', 'activate']
})
export class UserCommand extends SubCommandPluginCommand {
	public async upload(message: Message) {
		const { attachments, member, guild } = message;
		const location = attachments.first()?.url as string;
		const formFile: IForm = await fetch<Form>(location, FetchResultTypes.JSON);
		if (member) {
			let _form = await registerForm(formFile, member.user);
			_form = await _form.populate('questions');
			const form = new Form(_form);

			if (guild) {
				const _guild = await GuildModel.findOne({ guildId: guild.id });
				if (_guild) {
					const [channel] = await parseChannel(guild, _guild.channels.forms);
					if (channel?.isText()) {
						await channel.send({ embeds: [form.createEmbed()], components: form.createComponents('LIST') });
					}
				}
			}

			return temporaryReply(message, `${bold(_form.title)} is successfully registered with an id of ${inlineCode(_form._id)}`, true);
		}

		return temporaryReply(message, `Error occured! Pkease try again`, true);
	}
}
