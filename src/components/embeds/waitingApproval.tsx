import { italic, roleMention } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import type FormEntry from '../../actions/FormEntry/FormEntry';
import { DefaultAvatar } from '../../lib/constants';

export default function waitingApproval(entry: FormEntry, dm = true) {
	const reward =
		entry.form.rewardRoles.length && !dm ? (
			<field name="Reward Roles">{entry.form.rewardRoles.map((role) => roleMention(role)).join(', ')}</field>
		) : null;
	return (
		<embed color="RED">
			<title>{`${entry.form.title} Application`}</title>
			<description>{entry.form.description ?? italic('No description')}</description>
			<field name="Status">{italic(`Sent for approval`)}</field>
			{reward}
			<footer iconURL={DefaultAvatar}>C4shuALL Community v1</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
