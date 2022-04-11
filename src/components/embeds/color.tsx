import { EmbedJsx } from '@sapphire/embed-jsx';
import { DefaultFooter } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

function colorSelector() {
	return (
		<embed color={randomColor()}>
			<title>{`Nickname Color Selector`}</title>
			<description>{`Select one from the selection menu below to change your nickname color.`}</description>
			<footer>{DefaultFooter}</footer>
			<timestamp>{new Date()}</timestamp>
		</embed>
	);
}

export default colorSelector;
