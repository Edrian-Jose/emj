import { bold, inlineCode } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import utilityWebhookSend from '../../actions/Channel/Webhook/utilityWebhookSend';
import registerForm from '../../actions/Form/registerForm';
import Form from '../../actions/Form/Strategies/Form';
import temporaryReply from '../../actions/Message/temporaryReply';
import { avatar } from '../../lib/constants';
import type { Form as IForm } from '../../schemas/Form';
import GuildModel from '../../schemas/Guild';

@ApplyOptions<SubCommandPluginCommandOptions>({
	subCommands: ['upload', 'activate']
})
export class UserCommand extends SubCommandPluginCommand {
	public async upload(message: Message) {
		const { attachments, member, guild } = message;
		const location = attachments.first()?.url;
		if (!location) {
			return temporaryReply(message, `Attach the .emjform or .json file that you want to upload`, true);
		}
		const formFile: IForm = await fetch<Form>(location, FetchResultTypes.JSON);

		await message.channel.sendTyping();
		if (member && guild) {
			const _guild = await GuildModel.findOne({ guildId: guild.id });
			if (_guild?.channels.forms) {
				let _form = await registerForm(formFile, member.user);
				_form = await _form.populate('questions');
				const form = new Form(_form);

				if (guild) {
					await utilityWebhookSend(guild, member, 'forms', {
						username: 'Secretary',
						avatarURL: avatar.admissionSecretary,
						embeds: [form.createEmbed()],
						components: form.createComponents('OWNER')
					});
				}

				return temporaryReply(message, `${bold(_form.title)} is successfully registered with an id of ${inlineCode(_form._id)}`, true);
			} else {
				return temporaryReply(message, `Contact the admin to setup the forms channel first`, true);
			}
		}

		return temporaryReply(message, `Error occured! Pkease try again`, true);
	}
}