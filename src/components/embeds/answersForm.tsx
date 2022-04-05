import { italic } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import type { EntryAnswer } from '../../actions/Form/handleFormCommand';
import { DefaultAvatar } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

export default function answersForm(title: string, description: string, answers: EntryAnswer[]) {
	const fields = answers.map((answer) => {
		return <field name={`${answer.question.value}`}>{answer.value?.length ? answer.value?.join(', ') : italic('No response')}</field>;
	});
	return (
		<embed color={randomColor()}>
			<title>{title}</title>
			<description>{description}</description>
			{...fields}
			<footer iconURL={DefaultAvatar}>Report to the managers if there's an error on this</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
