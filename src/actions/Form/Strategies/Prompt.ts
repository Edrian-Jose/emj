const { Modal, TextInputComponent } = require('discord-modals');
import { MessageButton, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
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
	readonly options?: { label: string; value: string; description?: string }[];
	readonly placeholder?: string;
	readonly command?: string;

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
		this.command = question.command;
	}

	public createEmbed(footerText?: string, value?: string) {
		return prompt(this, footerText, value);
	}

	public createOptionComponents(value?: string) {
		let options: MessageButton[] = [];
		const skipButton = new MessageButton().setLabel('Skip').setCustomId(`___entry-skip-${this.formId}`).setStyle('SECONDARY');
		const clearButton = new MessageButton().setLabel('Clear').setCustomId(`___entry-clear-${this.formId}`).setStyle('SECONDARY');
		let navButton = clearButton;

		options = this.options!.map((option) => {
			return new MessageButton()
				.setLabel(option.label)
				.setCustomId(`___option-${this._id}-${this.formId}-${option.value}`)
				.setStyle(value === option.value ? 'SUCCESS' : 'SECONDARY');
		});

		if (!this.required && !value) {
			navButton = skipButton;
		} else if (value && !this.required) {
			navButton = clearButton;
		}

		return [options, navButton];
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

	getSelectPLaceholder() {
		const min = this.minSelected ?? 1;
		const max = this.maxSelected ?? 1;

		if (!this.minSelected && !this.maxSelected && !this.required) {
			return `Select one or skip this question`;
		}

		if (!this.minSelected && !this.maxSelected && this.required) {
			return `Select atleast one from the options`;
		}

		if (this.minSelected && !this.maxSelected) {
			return `Select atleast ${min} from the options`;
		}

		if (this.maxSelected && !this.minSelected) {
			return `Select atmost ${max} from the options`;
		}

		if (min === max) {
			return `Select ${min} from the options`;
		}

		return `Select ${min}-${max} from the options`;
	}

	public createSelectComponent(defaults?: string[]) {
		const selectMenu = new MessageSelectMenu();
		const skipButton = new MessageButton().setLabel('Skip').setCustomId(`___entry-skip-${this.formId}`).setStyle('SECONDARY');
		const clearButton = new MessageButton().setLabel('Clear').setCustomId(`___entry-clear-${this.formId}`).setStyle('SECONDARY');
		let navButton = clearButton;
		selectMenu.setCustomId(`___select-${this._id}-${this.formId}`);
		selectMenu.setPlaceholder(this.getSelectPLaceholder());
		if (this.minSelected) {
			selectMenu.setMinValues(this.minSelected);
		}
		if (this.maxSelected) {
			selectMenu.setMaxValues(this.maxSelected);
		}
		let options: MessageSelectOptionData[] = this.options ?? [];
		if (defaults) {
			options = options.map((option) => {
				if (defaults.includes(option.value)) {
					option.default = true;
				}
				return option;
			});
		}
		selectMenu.setOptions(...options);

		if (!this.required && (!defaults || !defaults.length)) {
			navButton = skipButton;
		} else if (defaults && !this.required) {
			navButton = clearButton;
		}

		return [selectMenu, navButton];
	}

	public createQuestionComponents(value: any = false) {
		switch (this.type) {
			case 'SELECT':
				return this.createSelectComponent(value as string[]);
			case 'OPTION':
				return this.createOptionComponents(value as string);
			case 'BOOLEAN':
				return this.createOptionComponents(value as string);
			default:
				return this.createInputComponents(value as boolean);
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
