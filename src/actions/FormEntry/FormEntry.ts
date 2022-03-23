import { MessageActionRow, MessageButton } from 'discord.js';
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
		let value = this.answers[this.index] ? this.answers[this.index].answer?.map(answer => answer.label).join(', ') : undefined;
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
		if (this.index < this.answers.length && this.answers[this.index] && this.answers[this.index].answer) {
			actions.push(nextButton);
		}
		if (this.form.questions.length === this.answers.length) {
			actions.push(submitButton);
		}
		actions.push(cancelButton);

		return actions;
	}

	public createComponents() {
		const currentType = this.getPrompt().type;
		const actionRow = new MessageActionRow();
		const actionRow2 = new MessageActionRow();
		const hasValue = this.answers[this.index] && this.answers[this.index].answer ? true : false;
		const values =
			this.answers[this.index] && this.answers[this.index].answer ? this.answers[this.index].answer?.map((answer) => answer.value) : undefined;
		switch (currentType) {
			case 'SELECT':
				const selectComponents = this.questions[this.index].createQuestionComponents(values);
				actionRow.addComponents(...selectComponents.splice(0, 1));
				actionRow2.addComponents(...selectComponents, ...this.createNavigatorButtons());
				return [actionRow, actionRow2];

			default:
				actionRow.addComponents(...this.questions[this.index].createQuestionComponents(hasValue), ...this.createNavigatorButtons());
				return [actionRow];
		}
	}
}

export default FormEntry;
