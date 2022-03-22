const { Modal, TextInputComponent } = require('discord-modals');
import { MessageButton, MessageSelectMenu } from 'discord.js';
import prompt from '../../../components/embeds/prompt';
import type { Question, QuestionDocument, QuestionType } from './../../../schemas/Question';
class Prompt implements Question {
	readonly _id: string;
	readonly creatorId: string;
	readonly formId: string;
	readonly type: QuestionType;
	readonly required: boolean;
	readonly question: string;
	readonly value: string;
	readonly minSelected?: number;
	readonly maxSelected?: number;
	readonly options?: [{ label: string; value: string; description?: string }];
	readonly placeholder?: string;

	public constructor(formId: string, question: QuestionDocument) {
		this.formId = formId;
		this._id = question._id;
		this.creatorId = question.creatorId;
		this.type = question.type;
		this.value = question.value;
		this.required = question.required ?? false;
		this.question = question.value;
		this.placeholder = question.placeholder;
		this.minSelected = question.minSelected;
		this.maxSelected = question.maxSelected;
		this.options = question.options;
	}

	public createEmbed(footerText?: string, value?: string) {
		return prompt(this, footerText, value);
	}

	public createInputComponents(withValue: boolean) {
		const actions: MessageButton[] = [];
		actions.push(
			new MessageButton()
				.setLabel(withValue ? 'Change Input' : 'Set Input')
				.setCustomId(`___input-${this._id}-${this.formId}`)
				.setStyle('SECONDARY')
		);

		if (!this.required && !withValue) {
			actions.push(new MessageButton().setLabel('Skip').setCustomId(`___entry-skip-${this.formId}`).setStyle('SECONDARY'));
		} else if (withValue && !this.required) {
			actions.push(new MessageButton().setLabel('Clear').setCustomId(`___entry-clear-${this.formId}`).setStyle('SECONDARY'));
		}
		return actions;
	}

	public createSelectComponent() {
		const selectMenu = new MessageSelectMenu();
		const skipButton = new MessageButton().setLabel('Skip').setCustomId(`___entry-skip-${this.formId}`).setStyle('SECONDARY');
		selectMenu.setCustomId(`___select-${this._id}-${this.formId}`);
		if (this.placeholder) {
			selectMenu.setPlaceholder(this.placeholder);
		}
		if (this.minSelected) {
			selectMenu.setMinValues(this.minSelected);
		}
		if (this.maxSelected) {
			selectMenu.setMaxValues(this.maxSelected);
		}
		selectMenu.setOptions(...this.options);
		return [selectMenu, skipButton];
	}

	public createQuestionComponents(withValue = false) {
		switch (this.type) {
			case 'SELECT':
				return this.createSelectComponent();
			default:
				return this.createInputComponents(withValue);
		}
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
