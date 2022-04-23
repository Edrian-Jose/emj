import { EmbedJsx } from '@sapphire/embed-jsx';
import { DefaultFooter } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

function RNotif(forScreening: string[], forDropping: string[]) {
	return (
		<embed color={randomColor()}>
			<title>R-Encode Weekly Notification</title>
			<description>Weekly notifications that needs attention</description>
			<field name="For Screening">{forScreening.length ? forScreening.join(',\n') : '_No students_'}</field>
			<field name="For Dropping">{forDropping.length ? forDropping.join(',\n') : '_No students_'}</field>
			<footer>{DefaultFooter}</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}

export default RNotif;
