const { Modal, TextInputComponent } = require('discord-modals');
import { MessageButton } from 'discord.js';
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

	public createEmbed(footerText?: string, value?: string) {
		return prompt(this, footerText, value);
	}

	public createQuestionComponents(withValue = false) {
		const actions: MessageButton[] = [];
		actions.push(
			new MessageButton()
				.setLabel(withValue ? 'Change Input' : 'Set Input')
				.setCustomId(`___input-${this._id}-${this.formId}`)
				.setStyle('SECONDARY')
		);

		return actions;
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
