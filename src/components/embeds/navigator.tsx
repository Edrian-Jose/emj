import { EmbedJsx } from '@sapphire/embed-jsx';
import type FormEntry from '../../actions/FormEntry/FormEntry';

export default function navigator(formEntry: FormEntry) {
	return (
		<embed color="RED">
			<title>{formEntry.form.title}</title>
			<description>{formEntry.form.description ?? ''}</description>
			<footer>{`${formEntry.index + 1} of ${formEntry.form.questions.length}`}</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
