import { roleMention } from '@discordjs/builders';
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
			<title>{`Waiting for Approval`}</title>
			<description>
				Your form entry has been sent for approval. Go back here to check the status of the application. Click edit to delete your already
				sent application and send the edited application instead or you can click cancel to permanently delete your application.
			</description>
			<field name={entry.form.title}>{entry.form.description}</field>
			{reward}
			<footer iconURL={DefaultAvatar}>C4shuALL Community v1</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
