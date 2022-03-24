import type { ButtonInteraction, Message, MessageButton, ThreadChannel } from 'discord.js';
import webhookEdit from '../../Channel/Webhook/webhookEdit';
import type FormEntry from '../FormEntry';
const entryUpvote = async (entry: FormEntry, interaction: ButtonInteraction) => {
	//
	const requiredUpvote = Math.floor((entry.verifiers?.length ?? 0) * 0.6);
	const message = interaction.message as Message;
	const channel = interaction.channel as ThreadChannel;
	const components = message.components[0].components;
	const upvoteButton = components[0] as MessageButton;
	const downvoteButton = components[1] as MessageButton;
	let upvotes = upvoteButton.label ? parseInt(upvoteButton.label) : 0;
	let downvotes = downvoteButton.label ? parseInt(downvoteButton.label) : 0;
	upvotes += 1;
	upvoteButton.setLabel(upvotes.toString());

	await webhookEdit(channel.parent!, message, {
		embeds: message.embeds,
		components: [message.components[0].setComponents(upvoteButton, components[1], components[2], components[3])],
		threadId: channel.id
	});
	if (upvotes >= requiredUpvote && upvotes > downvotes) {
		await interaction.followUp({
			content: `Upvote succesfully. The application has been approved because of sufficient upvotes.`,
			ephemeral: true
		});
		//TODO: trigger approve here
	} else {
		await interaction.followUp({
			content: `Upvote succesfully. ${Math.max(
				requiredUpvote - upvotes,
				downvotes - upvotes + 1
			)} more for automatic approval, Or you can approve now by clicking the ☑️ button.`,
			ephemeral: true
		});
	}
};

export default entryUpvote;
