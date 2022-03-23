import { MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';
import navigator from '../../components/embeds/navigator';
import type { FormDocument } from '../../schemas/Form';
import type { FormEntry as IFormEntry, FormEntryDocument } from '../../schemas/FormEntry';
import Form from '../Form/Strategies/Form';
import Prompt from '../Form/Strategies/Prompt';

export type EntrySubActions = 'back' | 'next' | 'cancel' | 'submit' | 'skip' | 'clear';
class FormEntry implements IFormEntry {
	_id: string;
	_document: FormEntryDocument;
	index: number;
	location: { type: 'DM' | 'GUILD_TEXT'; guildId?: string | undefined; channelId: string };
	form: Form;
	ownerId: string;
	navigatorId: string;
	questions: Prompt[];

	answers: { question: any; answer?: { label: string; value: string }[] }[];

	public constructor(entry: FormEntryDocument) {
		this._document = entry;
		this._id = entry._id;
		this.index = entry.index;
		this.location = entry.location;
		this.form = new Form(entry.form);
		this.ownerId = entry.ownerId;
		this.navigatorId = entry.navigatorId;
		this.questions = (entry.form as FormDocument).questions.map((question) => new Prompt(entry._id, question));
		this.answers = entry.answers.map((answer) => {
			return {
				question: new Prompt(entry._id, answer.question),
				answer: answer.answer
			};
		});
	}

	public createNavigatorEmbed() {
		return navigator(this);
	}

	public getPrompt() {
		return this.questions[this.index];
	}
	public createQuestionEmbed() {
		let value = this.answers[this.index] ? this.answers[this.index].answer?.map((answer) => answer.label).join(', ') : undefined;
		return this.questions[this.index].createEmbed(`${this.index + 1} of ${this.questions.length}`, value);
	}

	public createNavigatorButtons() {
		const actions: MessageButton[] = [];
		const backButton = new MessageButton().setLabel('Back').setCustomId(`___entry-back-${this._id}`).setStyle('PRIMARY');
		const nextButton = new MessageButton().setLabel('Next').setCustomId(`___entry-next-${this._id}`).setStyle('PRIMARY');
		const cancelButton = new MessageButton().setLabel('Cancel').setCustomId(`___entry-cancel-${this._id}`).setStyle('DANGER');
		const submitButton = new MessageButton().setLabel('Submit').setCustomId(`___entry-submit-${this._id}`).setStyle('SUCCESS');

		if (this.index > 0) {
			actions.push(backButton);
		}
		if (this.index < this.answers.length && this.answers[this.index] && this.answers[this.index].answer?.length) {
			actions.push(nextButton);
		}
		if (this.form.questions.length === this.answers.length) {
			actions.push(submitButton);
		}
		actions.push(cancelButton);

		return actions;
	}

	createOptionComponents(value?: string) {
		const actionRow = new MessageActionRow();
		const actionRow2 = new MessageActionRow();

		const optionComponents = this.questions[this.index].createQuestionComponents(value) as [MessageButton[], MessageButton];
		if (optionComponents[0].length > 2) {
			actionRow.addComponents(...optionComponents[0]);
			actionRow2.addComponents(optionComponents[1], ...this.createNavigatorButtons());
			return [actionRow, actionRow2];
		} else {
			actionRow.addComponents(...optionComponents[0], optionComponents[1], ...this.createNavigatorButtons());
			return [actionRow];
		}
	}

	public createComponents() {
		const currentType = this.getPrompt().type;
		const actionRow = new MessageActionRow();
		const actionRow2 = new MessageActionRow();
		const hasValue = this.answers[this.index] && this.answers[this.index].answer?.length ? true : false;
		const values =
			this.answers[this.index] && this.answers[this.index].answer ? this.answers[this.index].answer?.map((answer) => answer.value) : undefined;
		switch (currentType) {
			case 'SELECT':
				const selectComponents = this.questions[this.index].createQuestionComponents(values) as [MessageSelectMenu, MessageButton];
				actionRow.addComponents(selectComponents[0]);
				actionRow2.addComponents(selectComponents[1], ...this.createNavigatorButtons());
				return [actionRow, actionRow2];
			case 'OPTION':
				return this.createOptionComponents(values ? values[0] : undefined);
			case 'BOOLEAN':
				return this.createOptionComponents(values ? values[0] : undefined);
			default:
				actionRow.addComponents(
					...(this.questions[this.index].createQuestionComponents(hasValue) as MessageButton[]),
					...this.createNavigatorButtons()
				);
				return [actionRow];
		}
	}
}

export default FormEntry;
