import type FormEntry from '../FormEntry/FormEntry';
import defaultSubmit from './Commands/defaultSubmit';
import executeQuestionCommand from './handlePromptCommand';
import type Prompt from './Strategies/Prompt';

export type EntryAnswer = {
	value?: string[];
	question: Prompt;
};

export type FormCommand = (...answers: EntryAnswer[]) => Promise<void>;

interface FormCommands {
	[name: string]: FormCommand;
}

const customCommands: FormCommands = {
	defaultSubmit: defaultSubmit
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
					executer(...answers);
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
				executer(...answers);
			}
		});
	}
};

export default executeFormCommand;
