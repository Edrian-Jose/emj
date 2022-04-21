import type { ButtonInteraction } from 'discord.js';
import type RStudent from '../../RStudent';

const backStudent = async (rstudent: RStudent, dako: string) => {
	console.log(rstudent.reference, dako);
	// TODO: split dako to dako and oras if possible use | as seperator
	// TODO: send trainee or student messages and delete out messages
	// TODO: update trainee or student rows and delete removedRow
	// TODO: update database to add the message locations and remove out location

	rstudent._document.removedAt = undefined;
	await rstudent._document.save();
};

const backSubmit = async (rstudent: RStudent, interaction: ButtonInteraction | any) => {
	console.log(rstudent.reference, interaction.customId);

	try {
		const dako: string | undefined = interaction.getTextInputValue(`dako`);
		if (dako) {
			await backStudent(rstudent, dako);
		}
	} catch (error) {
		console.log(error);
	}
};

export default backSubmit;
