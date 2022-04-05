import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const RandomLoadingMessage = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];
export const DefaultAvatar = 'https://cdn.discordapp.com/attachments/950426634484342875/950773850298257448/Screenshot_20220304_001506.png';
export const DefaultFooter = 'C4$huALL Community v1';
export const avatar = {
	admissionSecretary: 'https://cdn.discordapp.com/attachments/950426634484342875/960741835393863730/secretary.png?width=451&height=451'
};

export const webhooks = {
	random: [
		{
			name: 'Adam',
			avatar: 'https://media.discordapp.net/attachments/950426634484342875/960742751027200040/Adam.png?width=451&height=451'
		},
		{
			name: 'Mary',
			avatar: 'https://media.discordapp.net/attachments/950426634484342875/960742850264465408/Mary.png?width=451&height=451'
		},
		{
			name: 'MJ',
			avatar: 'https://media.discordapp.net/attachments/950426634484342875/960742804999503912/MJ.png?width=451&height=451'
		}
	]
};