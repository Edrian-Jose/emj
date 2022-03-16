import { userMention } from '@discordjs/builders';
import { ButtonInteraction, Message } from 'discord.js';

const formInstanceDelete = async (interaction: ButtonInteraction) => {
	const { message } = interaction;
	if (message instanceof Message) {
		const embed = message.embeds[0];
		const creatorField = embed.fields.find((field) => field.name === 'Creator ID');
		if (creatorField) {
			await interaction.reply({
				content: `Form doesn't exist. Ask ${userMention(creatorField.value)} if they deleted the form.`,
				ephemeral: true
			});
		} else {
			await interaction.reply({ content: `Form doesn't exist. Ask the creator(s) or the admin if they deleted the form.`, ephemeral: true });
		}
		if (message.deletable) {
			await message.delete();
		}
	}
};

export default formInstanceDelete;
