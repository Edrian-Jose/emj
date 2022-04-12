import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import mongoose from 'mongoose';
import formCreate from '../../actions/Form/Subactions/formCreate';
import FormModel, { FormDocument } from '../../schemas/Form';

export const data = new SlashCommandBuilder()
	.setName('fill')
	.setDescription('Fill-out a form by using this command')
	.addStringOption((option) => option.setName('id').setDescription('the id or the alias of the form').setRequired(true));

export const execute = async (interaction: CommandInteraction) => {
	const aliasOrId = interaction.options.getString('id', true);
	let _form: FormDocument | null = null;
	if (mongoose.isValidObjectId(aliasOrId)) {
		_form = await FormModel.findById(aliasOrId).populate('questions').exec();
	} else {
		_form = await FormModel.findOne({ alias: aliasOrId }).populate('questions').exec();
	}

	if (_form) {
		await formCreate(_form, interaction);
	} else {
		await interaction.reply({ content: `No form found with an id or alias of ${aliasOrId}`, ephemeral: true });
	}
};
