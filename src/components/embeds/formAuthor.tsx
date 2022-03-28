import { EmbedJsx } from '@sapphire/embed-jsx';
import { DefaultFooter } from '../../lib/constants';

function formAuthor() {
	return (
		<embed color="RED">
			<title>Who will be the author that will be shown in form</title>
			<description>
				Choose 'Myself' if you want to be the author of this form or choose 'As a bot' if you want the the bot to represent you.
			</description>
			<footer>{DefaultFooter}</footer>
			<timestamp>{new Date()}</timestamp>
		</embed>
	);
}

export default formAuthor;
