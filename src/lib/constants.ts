import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const RandomLoadingMessage = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];
export const DefaultAvatar = 'https://cdn.discordapp.com/attachments/950426634484342875/950773850298257448/Screenshot_20220304_001506.png';
export const DefaultFooter = 'C4$huALL Community v1';
export const avatar = {
	admissionSecretary:
		'https://cdn.discordapp.com/attachments/949328501490745414/953485377354727435/secretary-woman-business-working-avatar-glasses-512.png'
};

export const webhooks = {
	random: [
		{
			name: 'Adam',
			avatar: 'https://cdn.discordapp.com/attachments/950426634484342875/953525405934055444/man2.png'
		},
		{
			name: 'Mary',
			avatar: 'https://cdn.discordapp.com/attachments/950426634484342875/953525440822251520/girl6.png'
		}
	]
};