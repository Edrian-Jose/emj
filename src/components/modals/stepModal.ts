import type FormEntry from '../../actions/FormEntry/FormEntry';
import type { FormDocument } from '../../schemas/Form';

const { Modal, TextInputComponent } = require('discord-modals');

const stepModal = (form: FormDocument, entry?: FormEntry) => {
	const components = form.questions.map((question, i) => {
		const component = new TextInputComponent()
			.setCustomId(`${question._id}`)
			.setLabel(`${question.value}`)
			.setStyle(question.type === 'TEXT' ? 'LONG' : 'SHORT')
			.setRequired(question.required ?? false)
			.setPlaceholder(`${question.placeholder}`);

		if (question.default) {
			component.setDefaultValue(question.default);
		}

		if (entry && entry.answers[i] && entry.answers[i].answer) {
			const value = entry.answers[i]?.answer?.at(0)?.label;
			if (value) {
				component.setDefaultValue(value);
			}
		}

		return component;
	});

	const modal = new Modal()
		.setCustomId(entry ? `___entry-editModal-${entry._id}` : `___form-submitModal-${form._id}`)
		.setTitle(`${form.title}`)
		.addComponents(...components);

	return modal;
};

export default stepModal;
