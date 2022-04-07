import type FormEntry from '../FormEntry/FormEntry';
import basicAdmission from './Commands/basicAdmission';
import createEvent from './Commands/createEvent';
import defaultSubmit from './Commands/defaultSubmit';
import executeQuestionCommand from './handlePromptCommand';
import type Prompt from './Strategies/Prompt';

export type EntryAnswer = {
	value?: string[];
	question: Prompt;
};

export type FormCommand = (entry: FormEntry, ...answers: EntryAnswer[]) => Promise<void>;

interface FormCommands {
	[name: string]: FormCommand;
}

const customCommands: FormCommands = {
	defaultSubmit,
	basicAdmission,
	createEvent
};

const executeFormCommand = (entry: FormEntry, success = false) => {
	const { form } = entry;
	const { commands } = form;
	const answers: EntryAnswer[] = entry.answers.map((answer) => {
		return {
			value: answer.answer?.map((answer) => answer.value),
			question: answer.question
		};
	});

	if (success) {
		if (commands?.onSubmit) {
			commands.onSubmit.forEach((command) => {
				if (Object.keys(customCommands).includes(command)) {
					const executer = customCommands[command];
					executer(entry, ...answers);
				}
			});
		}

		answers.forEach((answer) => {
			executeQuestionCommand(entry, answer.question, answer.value);
		});
	} else if (commands?.onCancel) {
		commands.onCancel.forEach((command) => {
			if (Object.keys(customCommands).includes(command)) {
				const executer = customCommands[command];
				executer(entry, ...answers);
			}
		});
	}
};

export default executeFormCommand;
