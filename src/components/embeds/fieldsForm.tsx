import { EmbedJsx } from '@sapphire/embed-jsx';
import { DefaultAvatar, DefaultFooter } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

export default function fieldsForm(title: string, description: string, labels: string[], values: string[], timestamp?: number) {
	const fields = labels.map((label, i) => {
		return <field name={`${label}`}>{values[i] ? values[i] : 'N/A'}</field>;
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
