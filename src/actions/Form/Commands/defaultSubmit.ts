import type { FormCommand } from '../handleFormCommand';

const defaultSubmit: FormCommand = async (...answers) => {
	console.log(answers);
};

export default defaultSubmit;
