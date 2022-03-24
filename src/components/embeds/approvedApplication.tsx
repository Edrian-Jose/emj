import { italic, roleMention } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import moment from 'moment';
import type FormEntry from '../../actions/FormEntry/FormEntry';
import { DefaultAvatar } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

export default function approvedApplication(entry: FormEntry, userName: string, dm = true) {
	const emoji = '📝';
	const reward =
		entry.form.rewardRoles.length && !dm ? (
			<field name="Reward Roles">{entry.form.rewardRoles.map((role) => roleMention(role)).join(', ')}</field>
		) : null;
	return (
		<embed color={randomColor()}>
			<title>{`${emoji} ${entry.form.title} Entry`}</title>
			<description>{entry.form.description ?? italic('No description')}</description>
			<field name="Formfiller">{`${entry.ownerId}`}</field>
			<field name="Approved by">{userName ?? 'Anonymous User'}</field>
			{reward}
			<field name="Entry Creation Date">{moment(entry._document._id.getTimestamp()).format('dddd, MMMM Do YYYY, h:mm:ss a')}</field>
			<field name="Approval Date">{moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}</field>

			<footer iconURL={DefaultAvatar}>Approved</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
