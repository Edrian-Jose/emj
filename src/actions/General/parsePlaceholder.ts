import { container } from '@sapphire/framework';
import type { Snowflake } from 'discord.js';

const parseDataValue = async (type: string, id: Snowflake) => {
	try {
		switch (type) {
			case 'name':
				const user = await container.client.users.fetch(id);
				return user.username;
			default:
				const defUser = await container.client.users.fetch(id);
				return defUser.username;
		}
	} catch (error) {
		console.log(error);
		return 'Unknown';
	}
};

const parsePlaceholder = async (text: string) => {
	const i = text.indexOf('___');
	let parsedText: string = text;
	if (i >= 0) {
		const placeholder = text.substring(i, i + 26);
		let data = placeholder.substring(3, placeholder.length);
		let dataArray = data.split('-');
		let type = dataArray[0];
		let id = dataArray[1];
		const value = await parseDataValue(type, id);
		const newText = text.replace(placeholder, value);
		return await parsePlaceholder(newText);
	}
	return parsedText;
};

export default parsePlaceholder;
