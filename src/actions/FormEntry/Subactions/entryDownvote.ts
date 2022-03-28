import type { ButtonInteraction, Message, MessageButton, ThreadChannel } from 'discord.js';
import webhookEdit from '../../Channel/Webhook/webhookEdit';
const entryDownvote = async (interaction: ButtonInteraction) => {
	//
	const message = interaction.message as Message;
	const channel = interaction.channel as ThreadChannel;
	const components = message.components[0].components;
	const downvoteButton = components[1] as MessageButton;
	let downvotes = downvoteButton.label ? parseInt(downvoteButton.label) : 0;
	downvotes += 1;
	downvoteButton.setLabel(downvotes.toString());
	await webhookEdit(channel.parent!, message, {
		embeds: message.embeds,
		components: [message.components[0].setComponents(components[0], downvoteButton, components[2], components[3])],
		threadId: channel.id
	});

	await interaction.followUp({
		content: `Downvote succesfully.`,
		ephemeral: true
	});
};

export default entryDownvote;
