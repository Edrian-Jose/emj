import { userMention } from '@discordjs/builders';
import type { ButtonInteraction, Message } from 'discord.js';

const formInstanceDelete = async (interaction: ButtonInteraction) => {
	const { message, channel } = interaction;
	const isDM = !(channel && channel.type !== 'DM');
	if (message) {
		const embed = message.embeds[0];
		const creatorField = embed.fields?.find((field) => field.name === 'Creator ID');
		if (creatorField && !isDM) {
			await interaction.reply({
				content: `Form doesn't exist. Ask ${userMention(creatorField.value)} if they deleted the form.`,
				ephemeral: true
			});
		} else {
			await interaction.reply({ content: `Form doesn't exist. Ask the creator(s) or the admin if they deleted the form.`, ephemeral: true });
		}
		if ((message as Message).deletable) {
			await (message as Message).delete();
		}
	}
};

export default formInstanceDelete;
