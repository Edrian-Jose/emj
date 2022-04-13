import { EmbedJsx } from '@sapphire/embed-jsx';
import { DefaultFooter } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

function formAuthor() {
	return (
		<embed color={randomColor()}>
			<title>Collections available on this Server</title>
			<description>
				To view a collection use the command `!view [emoji]`. Replace the emoji with an emoji listed below that you want to view
			</description>
			<footer>{DefaultFooter}</footer>
			<timestamp>{new Date()}</timestamp>
		</embed>
	);
}

export default formAuthor;
