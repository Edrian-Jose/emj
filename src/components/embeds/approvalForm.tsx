import { italic, roleMention } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import type Form from '../../actions/Form/Strategies/Form';
import type FormEntry from '../../actions/FormEntry/FormEntry';
import { DefaultAvatar } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

export default function approvalForm(entry: FormEntry, form: Form, dm = true) {
	const emoji = '📝';
	const fields = entry.answers.map((answer, i) => {
		return (
			<field name={`${i + 1}. ${answer.question.value}`}>
				{answer.answer?.length ? answer.answer?.map((answer) => answer.label).join(', ') : italic('Skipped')}
			</field>
		);
	});
	const reward =
		entry.form.rewardRoles.length && !dm ? (
			<field name="Reward Roles">{entry.form.rewardRoles.map((role) => roleMention(role)).join(', ')}</field>
		) : null;
	return (
		<embed color={randomColor()}>
			<title>{`${emoji} ${form.title} Entry`}</title>
			<description>{form.description ?? italic('No description')}</description>
			<field name="Formfiller">{`${entry.ownerId}`}</field>
			{reward}
			{...fields}
			<footer iconURL={DefaultAvatar}>👍 Upvote 👎 Downvote ☑️ Approve ❎ Deny</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
