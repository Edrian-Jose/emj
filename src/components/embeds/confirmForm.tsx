import { italic } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import type Form from '../../actions/Form/Strategies/Form';
import type FormEntry from '../../actions/FormEntry/FormEntry';
import { DefaultAvatar } from '../../lib/constants';

export default function confirmForm(entry: FormEntry, form: Form) {
	const emoji = form.verification ? '🔸' : '🔹';
	const fields = entry.answers.map((answer) => {
		return (
			<field name={answer.question.value}>
				{answer.answer?.length ? answer.answer?.map((answer) => answer.label).join(', ') : italic('Skipped')}
			</field>
		);
	});
	return (
		<embed color="RED">
			<title>{`${emoji} Submit Confirmation`}</title>
			<description>Review your answers before clicking the confirm button</description>
			<field name={form.title}>{`${form.description}`}</field>
			{...fields}
			<footer iconURL={DefaultAvatar}>
				By clicking the confirm button, You allow the admin of this server to collect and utilize your information.
			</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
