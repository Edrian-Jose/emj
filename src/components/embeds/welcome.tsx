import { italic } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import type { GuildMember } from 'discord.js';
import { getGuildDocument } from '../../actions/Guild/syncGuild';
import { DefaultAvatar } from '../../lib/constants';
import randomColor from '../../lib/randomColor';
import FormModel from '../../schemas/Form';

export default async function welcome(member: GuildMember) {
	let formId: string | undefined;
	let questionsString: string = italic('This server has no apllication form');
	const [_guild] = await getGuildDocument(member.guild);

	formId = _guild?.join.form;
	const _form = await FormModel.findById(formId).populate('questions').exec();
	if (_form) {
		questionsString = _form.questions.map((question) => question.value).join(', ');
	}
	const desc = _form ? <field name="What are asked in the Application form">{questionsString}</field> : null;
	return (
		<embed color={randomColor()}>
			<title>{`Welcome to ${member.guild.name}`}</title>
			<description>{member.guild.description ?? italic('No server description')}</description>
			<field name="How to become a member?">
				{_form ? `Click the join button below and answer the application form` : `You are now a member!`}
			</field>
			{desc}
			<footer iconURL={DefaultAvatar}>C4$huALL Community v1</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
