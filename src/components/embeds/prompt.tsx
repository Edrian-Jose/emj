import { EmbedJsx } from '@sapphire/embed-jsx';
import type Prompt from '../../actions/Form/Strategies/Prompt';

export default function prompt(prompt: Prompt) {
	const placeholder = prompt.placeholder ? <description>{prompt.placeholder}</description> : null;
	const required = prompt.required ? 'Required' : 'Optional';
	return (
		<embed color="RED">
			<title>{prompt.question}</title>
			{placeholder}
			<footer>{`${required} | ${prompt._id}`}</footer>
		</embed>
	);
}
