import { EmbedJsx } from '@sapphire/embed-jsx';
import type Prompt from '../../actions/Form/Strategies/Prompt';

export default function prompt(prompt: Prompt, footerText?: string, value?: string) {
	const placeholder = prompt.placeholder ? <description>{prompt.placeholder}</description> : null;
	const required = prompt.required ? 'Required' : 'Optional';
	const valueField = value ? <field name="Recorded Input">{`${value}`}</field> : null;
	return (
		<embed color={[100, 255, 100]}>
			<title>{`${prompt.question}`}</title>
			{placeholder}
			{valueField}
			<footer>{`${required} | ${footerText ?? prompt._id}`}</footer>
			<timestamp>{Date.now()}</timestamp>
		</embed>
	);
}
