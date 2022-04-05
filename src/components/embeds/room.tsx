import { italic, userMention } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import type Room from '../../actions/Room/Room';
import { DefaultAvatar, DefaultFooter } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

export default async function room(room: Room, count?: number) {
	const level: string[] = [];
	if (room.locked) {
		level.push('Private');
	}
	if (room.hidden) {
		level.push('Hidden');
	}
	if (!room.hidden && !room.locked) {
		level.push('Public');
	}
	const membersCount = !room.hidden ? <field name="Members Count">{`${count ?? 1}`}</field> : null;
	return (
		<embed color={randomColor()}>
			<title>{room.name}</title>
			<description>{room.description ?? italic('No room description')}</description>
			<field name="Co-host">{room.cohost ? userMention(room.cohost) : 'No assigned cohost'}</field>
			<field name="Privacy Level">{level.join(' and ')}</field>
			{membersCount}
			<footer iconURL={DefaultAvatar}>{DefaultFooter}</footer>
			<timestamp>{room.createdTimestamp ?? Date.now()}</timestamp>
		</embed>
	);
}
