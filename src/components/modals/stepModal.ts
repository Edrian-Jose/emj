import type FormEntry from '../../actions/FormEntry/FormEntry';

const { Modal, TextInputComponent } = require('discord-modals');

const stepModal = (entry: FormEntry) => {
	const components = entry.questions.map((question, i) => {
		const component = new TextInputComponent()
			.setCustomId(`${question._id}`)
			.setLabel(`${question.value}`)
			.setStyle(question.type === 'TEXT' ? 'LONG' : 'SHORT')
			.setRequired(question.required ?? false)
			.setPlaceholder(`${question.placeholder}`);

		if (question.default) {
			component.setDefaultValue(question.default);
		}

		if (entry.answers[i] && entry.answers[i].answer) {
			const value = entry.answers[i]?.answer?.at(0)?.value;
			if (value) {
				component.setDefaultValue(value);
			}
		}

		return component;
	});

	const modal = new Modal() // We create a Modal
		.setCustomId(`___entry-submitModal-${entry._id}`)
		.setTitle(`${entry.form.title}`)
		.addComponents(...components);

	return modal;
};

export default stepModal;
