import { roleMention } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import type Form from '../../actions/Form/Strategies/Form';
import { DefaultAvatar } from '../../lib/constants';

export default function form(form: Form) {
	const description = form.description ? <description>{`${form.description}`}</description> : null;
	const questionNames = form.questions.map((question) => question.value);
	const requiredRoles = form.requiredRoles.length ? (
		<field name="Required Roles">{form.requiredRoles.map((role) => roleMention(role)).join(', ')}</field>
	) : null;
	const reward = form.rewardRoles.length ? <field name="Reward Roles">{form.rewardRoles.map((role) => roleMention(role)).join(', ')}</field> : null;
	const emoji = form.verification ? '🔸' : '🔹';
	return (
		<embed color="RED">
			<title>{`${emoji} ${form.title}`}</title>
			{description}
			<field name="What are asked?">{questionNames.join(', ')}</field>
			{requiredRoles}
			{reward}
			<footer iconURL={DefaultAvatar}>{`...${String(form._id).substring(12, 23)}`}</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
