import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import Prompt from '../../actions/Form/Strategies/Prompt';
import temporaryReply from '../../actions/Message/temporaryReply';
import QuestionModel from '../../schemas/Question';

@ApplyOptions<SubCommandPluginCommandOptions>({
	subCommands: ['form']
})
export class UserCommand extends SubCommandPluginCommand {
	public async form(message: Message) {
		const { channel } = message;
		const question = await QuestionModel.create({
			creatorId: message.member?.id,
			value: `What is asked?`,
			placeholder: 'Some description'
		});
		const prompt = new Prompt('121212', question);
		await channel.send({ embeds: [prompt.createEmbed()], components: prompt.createComponents() });
		return temporaryReply(message, 'Setup called', true);
	}
}
