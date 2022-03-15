const { Modal, TextInputComponent } = require('discord-modals');
import { MessageActionRow, MessageButton } from 'discord.js';
import prompt from '../../../components/embeds/prompt';
import type { QuestionDocument, QuestionType } from './../../../schemas/Question';
class Prompt {
	readonly _id: string;
	readonly formId: string;
	readonly type: QuestionType;
	readonly required: boolean;
	readonly question: string;
	readonly placeholder?: string;

	public constructor(formId: string, question: QuestionDocument) {
		this.formId = formId;
		this._id = question._id;
		this.type = question.type;
		this.required = question.required ?? false;
		this.question = question.value;
		this.placeholder = question.placeholder;
	}

	public createEmbed() {
		return prompt(this);
	}

	public createComponents(withValue = false) {
		const actionRow = new MessageActionRow().addComponents(
			new MessageButton()
				.setLabel(withValue ? 'Change Input' : 'Set Input')
				.setCustomId(`___input-${this._id}-${this.formId}`)
				.setStyle('SECONDARY')
		);
		if (withValue) {
			actionRow.addComponents(new MessageButton().setLabel('Next').setCustomId(`___form-next-${this.formId}`).setStyle('PRIMARY'));
		} else if (!this.required) {
			actionRow.addComponents(new MessageButton().setLabel('Skip').setCustomId(`___form-skip-${this.formId}`).setStyle('SECONDARY'));
		}

		actionRow.addComponents(new MessageButton().setLabel('Cancel').setCustomId(`___form-cancel-${this.formId}`).setStyle('DANGER'));
		return [actionRow];
	}

	public createInputModal() {
		const inputComponent = new TextInputComponent()
			.setCustomId(`input`)
			.setLabel(this.question)
			.setStyle(this.type === 'TEXT' ? 'LONG' : 'SHORT')
			.setRequired(this.required);

		if (this.placeholder) {
			inputComponent.setPlaceholder(this.placeholder);
		}

		const modal = new Modal() // We create a Modal
			.setCustomId(`___input-${this._id}-${this.formId}`)
			.setTitle(`SINGLE INPUT FORM`)
			.addComponents(inputComponent);

		return modal;
	}
}

export default Prompt;
