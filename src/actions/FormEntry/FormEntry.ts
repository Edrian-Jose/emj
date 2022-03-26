import { MessageActionRow, MessageButton, MessageSelectMenu, Snowflake } from 'discord.js';
import navigator from '../../components/embeds/navigator';
import stepModal from '../../components/modals/stepModal';
import type { FormDocument } from '../../schemas/Form';
import type { FormEntry as IFormEntry, FormEntryDocument } from '../../schemas/FormEntry';
import Form from '../Form/Strategies/Form';
import Prompt from '../Form/Strategies/Prompt';

export type EntrySubActions =
	| 'back'
	| 'next'
	| 'cancel'
	| 'submit'
	| 'skip'
	| 'clear'
	| 'cancelSubmit'
	| 'confirmSubmit'
	| 'edit'
	| 'upvote'
	| 'downvote'
	| 'approve'
	| 'deny'
	| 'denyModal'
	| 'accept'
	| 'submitModal';
class FormEntry implements IFormEntry {
	_id: string;
	_document: FormEntryDocument;
	index: number;
	location: { type: 'DM' | 'GUILD_TEXT'; guildId?: string | undefined; channelId: string };
	form: Form;
	ownerId: string;
	navigatorId: string;
	questions: Prompt[];
	verifiers?: Snowflake[];
	applicationId?: Snowflake;
	answers: { question: Prompt; answer?: { label: string; value: string }[] }[];

	public constructor(entry: FormEntryDocument) {
		this._document = entry;
		this._id = entry._id;
		this.index = entry.index;
		this.location = entry.location;
		this.form = new Form(entry.form);
		this.ownerId = entry.ownerId;
		this.navigatorId = entry.navigatorId;
		this.applicationId = entry.applicationId;
		this.verifiers = entry.verifiers;
		if ((entry.form as FormDocument).questions) {
			this.questions = (entry.form as FormDocument).questions.map((question) => new Prompt(entry._id, question));
		} else {
			this.questions = [];
		}
		
		this.answers = entry.answers.map((answer) => {
			return {
				question: new Prompt(entry._id, answer.question),
				answer: answer.answer
			};
		});
	}

	public createStepModal() {
		return stepModal(this);
	}
	public createVerifiedComponents() {
		const actionRows: MessageActionRow[] = [];
		const acceptButton = new MessageButton().setLabel('Accept').setCustomId(`___entry-accept-${this._id}`).setStyle('SUCCESS');

		actionRows.push(new MessageActionRow().addComponents(acceptButton));

		return actionRows;
	}
	public createVerificationComponents() {
		const actionRows: MessageActionRow[] = [];
		const approveButton = new MessageButton().setEmoji('☑️').setCustomId(`___entry-approve-${this._id}`).setStyle('PRIMARY');
		const denyButton = new MessageButton().setEmoji('❎').setCustomId(`___entry-denyModal-${this._id}`).setStyle('DANGER');
		const upvoteButton = new MessageButton().setEmoji('👍').setCustomId(`___entry-upvote-${this._id}`).setStyle('SECONDARY');
		const downvoteButton = new MessageButton().setEmoji('👎').setCustomId(`___entry-downvote-${this._id}`).setStyle('SECONDARY');
		actionRows.push(new MessageActionRow().addComponents(upvoteButton, downvoteButton, approveButton, denyButton));

		return actionRows;
	}
	public createSubmitComponents() {
		const actionRows: MessageActionRow[] = [];
		const cancelButton = new MessageButton().setLabel('Cancel').setCustomId(`___entry-cancelSubmit-${this._id}`).setStyle('SECONDARY');
		const confirmButton = new MessageButton().setLabel('Confirm').setCustomId(`___entry-confirmSubmit-${this._id}`).setStyle('SUCCESS');
		actionRows.push(new MessageActionRow().addComponents(confirmButton, cancelButton));

		return actionRows;
	}

	public createWaitComponents() {
		const actionRows: MessageActionRow[] = [];
		const cancelButton = new MessageButton().setLabel('Delete').setCustomId(`___entry-cancel-${this._id}`).setStyle('DANGER');
		const editButton = new MessageButton().setLabel('Edit').setCustomId(`___entry-edit-${this._id}`).setStyle('SUCCESS');
		const actionRow = new MessageActionRow();
		actionRow.addComponents(editButton, cancelButton);
		actionRows.push(actionRow);

		return actionRows;
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
		const actionRows: MessageActionRow[] = [];

		const optionComponents = this.questions[this.index].createQuestionComponents(value) as [MessageButton[], MessageButton];
		if (optionComponents[0].length > 2) {
			let buttonsChunks = this.splitArrayIntoChunksOfLen([...optionComponents[0]], 5);
			buttonsChunks.forEach((buttonsChunk) => {
				if (actionRows.length < 5) {
					actionRows.push(new MessageActionRow().addComponents(...buttonsChunk));
				}
			});
			buttonsChunks = this.splitArrayIntoChunksOfLen([optionComponents[1], ...this.createNavigatorButtons()], 5);
			buttonsChunks.forEach((buttonsChunk) => {
				if (actionRows.length < 5) {
					actionRows.push(new MessageActionRow().addComponents(...buttonsChunk));
				}
			});
			return actionRows;
		} else {
			const buttonsChunks = this.splitArrayIntoChunksOfLen([...optionComponents[0], optionComponents[1], ...this.createNavigatorButtons()], 5);
			buttonsChunks.forEach((buttonsChunk) => {
				if (actionRows.length < 5) {
					actionRows.push(new MessageActionRow().addComponents(...buttonsChunk));
				}
			});
			return actionRows;
		}
	}

	splitArrayIntoChunksOfLen<T>(arr: T[], len: number): T[][] {
		var chunks: T[][] = [],
			i = 0,
			n = arr.length;
		while (i < n) {
			chunks.push(arr.slice(i, (i += len)));
		}
		return chunks;
	}

	public createComponents() {
		const currentType = this.getPrompt().type;
		const actionRows: MessageActionRow[] = [];
		let buttonsChunks: MessageButton[][] = [];
		const hasValue = this.answers[this.index] && this.answers[this.index].answer?.length ? true : false;
		const values =
			this.answers[this.index] && this.answers[this.index].answer ? this.answers[this.index].answer?.map((answer) => answer.value) : undefined;
		switch (currentType) {
			case 'SELECT':
				const selectComponents = this.questions[this.index].createQuestionComponents(values) as [MessageSelectMenu, MessageButton];
				actionRows.push(new MessageActionRow().addComponents(selectComponents[0]));
				buttonsChunks = this.splitArrayIntoChunksOfLen([selectComponents[1], ...this.createNavigatorButtons()], 5);
				buttonsChunks.forEach((buttonsChunk) => {
					if (actionRows.length < 5) {
						actionRows.push(new MessageActionRow().addComponents(...buttonsChunk));
					}
				});
				return actionRows;
			case 'OPTION':
				return this.createOptionComponents(values ? values[0] : undefined);
			case 'BOOLEAN':
				return this.createOptionComponents(values ? values[0] : undefined);
			default:
				buttonsChunks = this.splitArrayIntoChunksOfLen(
					[...(this.questions[this.index].createQuestionComponents(hasValue) as MessageButton[]), ...this.createNavigatorButtons()],
					5
				);
				buttonsChunks.forEach((buttonsChunk) => {
					if (actionRows.length < 5) {
						actionRows.push(new MessageActionRow().addComponents(...buttonsChunk));
					}
				});
				return actionRows;
		}
	}
}

export default FormEntry;
