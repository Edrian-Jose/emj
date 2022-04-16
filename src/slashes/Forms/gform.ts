import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction, Message } from 'discord.js';
import GFormModel, { GFormDocument } from '../../schemas/GForm';
import type { APIMessage } from 'discord.js/node_modules/discord-api-types';

export const data = new SlashCommandBuilder()
	.setName('gform')
	.setDescription('Create, enable, or delete a gform watcher')
	.addStringOption((option) => option.setName('sheetid').setDescription('Spreadsheet id').setRequired(true))
	.addStringOption((option) => option.setName('formid').setDescription('Form ID').setRequired(true))
	.addNumberOption((option) => option.setName('tabindex').setDescription('Spreadsheet Tab. Defaults to 0'))
	.addNumberOption((option) => option.setName('limit').setDescription('Number of rows to fetch every loop. Def to 20'))
	.addNumberOption((option) => option.setName('offset').setDescription('Columns to ignore on fetching data from a row'))
	.addBooleanOption((option) => option.setName('enabled').setDescription('Toggle enable property of watcher'))
	.addBooleanOption((option) => option.setName('delete').setDescription('Delete the watcher'));

export const execute = async (interaction: CommandInteraction): Promise<APIMessage | Message> => {
	const sheetId = interaction.options.getString('sheetid', true);
	const formId = interaction.options.getString('formid', true);
	const tabIndex = interaction.options.getInteger('tabindex');
	const limit = interaction.options.getInteger('limit');
	const offset = interaction.options.getInteger('offset');
	const enabled = interaction.options.getBoolean('enabled');
	const deleteWatcher = interaction.options.getBoolean('delete');
	await interaction.deferReply({ ephemeral: true });
	let watcher: (GFormDocument & { _id: any }) | null = null;

	try {
		watcher = await GFormModel.findOne({ spreadSheetId: sheetId, form: formId }).exec();
	} catch (error) {
		return interaction.followUp({ content: `Error occured internally. Contact the admins for them to fix this issue.`, ephemeral: true });
	}

	if (deleteWatcher && watcher) {
		try {
			await watcher.delete();
		} catch (error) {
			console.log(error);
		} finally {
			return interaction.followUp({ content: `Gform Watcher with a sheetId of \`${sheetId}\` has been deleted`, ephemeral: true });
		}
	} else if (watcher) {
		if (tabIndex) {
			watcher.spreadSheetTabIndex = tabIndex;
		}

		if (limit) {
			watcher.limit = limit;
		}
		if (offset) {
			watcher.offsetColumn = offset;
		}

		if (enabled !== null) {
			watcher.enabled = enabled;
		}
		try {
			await watcher.save();
		} catch (error) {
			console.log(error);
		} finally {
			return interaction.followUp({ content: `Gform Watcher with a sheetId of \`${sheetId}\` has been successfully updated`, ephemeral: true });
		}
	} else {
		const newWatcher = {} as GFormDocument;
		newWatcher.spreadSheetId = sheetId;
		newWatcher.form = formId;

		if (tabIndex) {
			newWatcher.spreadSheetTabIndex = tabIndex;
		}

		if (limit) {
			newWatcher.limit = limit;
		}
		if (offset) {
			newWatcher.offsetColumn = offset;
		}

		if (enabled !== null) {
			newWatcher.enabled = enabled;
		}

		try {
			await GFormModel.create(newWatcher);
		} catch (error) {
			console.log(error);
		} finally {
			return interaction.followUp({ content: `Gform Watcher with a sheetId of \`${sheetId}\` has been successfully created`, ephemeral: true });
		}
	}
};
