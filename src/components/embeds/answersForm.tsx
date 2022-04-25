import { italic } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import moment from 'moment';
import type { EntryAnswer } from '../../actions/Form/handleFormCommand';
import { DefaultAvatar, DefaultFooter } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

export default function answersForm(title: string, description: string, answers: EntryAnswer[], timestamp?: number) {
	const fields = answers.map((answer) => {
		let value = answer.value?.length ? answer.value?.join(', ') : italic('No response');
		if (answer.question.type === 'DATE') {
			if (moment(parseInt(value)).isValid()) {
				value = moment(parseInt(value)).utcOffset(8).format('MM/DD/YYYY');
			}
		}

		if (answer.question.type === 'DATETIME') {
			value = moment(parseInt(value)).format('MM/DD/YYYY hh:mm A');
		}
		return <field name={`${answer.question.value}`}>{value}</field>;
	});
	return (
		<embed color={randomColor()}>
			<title>{title}</title>
			<description>{description}</description>
			{...fields}
			<footer iconURL={DefaultAvatar}>{DefaultFooter}</footer>
			<timestamp>{timestamp ?? Date.now()}</timestamp>
		</embed>
	);
}
