import { italic } from '@discordjs/builders';
import { EmbedJsx } from '@sapphire/embed-jsx';
import type { GuildMember } from 'discord.js';
import { DefaultFooter } from '../../lib/constants';
import randomColor from '../../lib/randomColor';

function changeNickname(member: GuildMember, oldNick: string) {
	return (
		<embed color={randomColor()}>
			<title>{`I changed my nickname to ${member.nickname ? member.nickname : italic('None')} from ${oldNick}`}</title>
			<description>{`This information is posted here due my unmanageable status`}</description>
			<footer>{DefaultFooter}</footer>
			<timestamp>{new Date()}</timestamp>
		</embed>
	);
}

export default changeNickname;
