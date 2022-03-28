import type FormEntry from '../FormEntry/FormEntry';
import changeNickname from './Commands/PromptCommands/changeNickname';
import type Prompt from './Strategies/Prompt';

export type QuestionCommand = (values: string[], prompt: Prompt, entry: FormEntry) => Promise<void>;

interface QuestionCommands {
	[name: string]: QuestionCommand;
}

const customCommands: QuestionCommands = {
	//
	changeNickname
};

const executeQuestionCommand = (entry: FormEntry, prompt: Prompt, values?: string[]) => {
	if (prompt.command && values) {
		if (Object.keys(customCommands).includes(prompt.command)) {
			const executer = customCommands[prompt.command];
			executer(values, prompt, entry);
		}
	}
};

export default executeQuestionCommand;
