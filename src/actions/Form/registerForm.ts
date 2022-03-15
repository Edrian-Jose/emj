import QuestionModel, { QuestionDocument } from '../../schemas/Question';
import type { Form } from '../../schemas/Form';
import type { User } from 'discord.js';
import FormModel from '../../schemas/Form';

const registerForm = async (form: Form, user: User) => {
	let questionsId: QuestionDocument['_id'][] = [];
	const { questions } = form;
	for (const question of questions) {
		question.creatorId = user.id;
		const _question = await QuestionModel.create(question);
		questionsId;
		questionsId.push(_question.id);
	}
	form.questions = questionsId;
	return await FormModel.create(form);
};

export default registerForm;
