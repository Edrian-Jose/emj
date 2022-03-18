import type { QuestionDocument } from './../../../schemas/Question';
import type { FormDocument } from './../../../schemas/Form';
import { MessageActionRow, MessageButton, Snowflake } from 'discord.js';
import type { Form as IForm, FormType, FormDestinationType, FormResultDestinationType } from '../../../schemas/Form';
import form from '../../../components/embeds/form';


export type FormSubActions = 'activate' | 'create' | 'delete' | 'start' | 'cancel';

class Form implements IForm {
	_id: string;
	creatorId: Snowflake;
	author: {
		userId: Snowflake;
		name: string;
		avatarURL: string;
	};
	title: string;
	type: FormType;
	description?: string;
	requiredRoles: Snowflake[];
	rewardRoles: Snowflake[];
	destination: [
		{
			type: FormDestinationType;
			ids: Snowflake[];
		}
	];
	resultDestination: {
		type: FormResultDestinationType;
		id: Snowflake;
	};
	instances: [
		{
			type: FormDestinationType;
			channelId: Snowflake;
			messageId: Snowflake;
		}
	];
	verification: boolean;

	questions: QuestionDocument[];

	public constructor(document: FormDocument) {
		this._id = document._id;
		this.creatorId = document.creatorId;
		this.author = document.author;
		this.title = document.title;
		this.type = document.type;
		this.description = document.description;
		this.requiredRoles = document.requiredRoles;
		this.rewardRoles = document.rewardRoles;
		this.destination = document.destination;
		this.resultDestination = document.resultDestination;
		this.instances = document.instances;
		this.verification = document.verification;
		this.questions = document.questions;
	}

	public createEmbed(dm = false) {
		return form(this, dm);
	}

	public createComponents(type: 'LIST' | 'OWNER' | 'INSTANCE' = 'INSTANCE') {
		const actionRow = new MessageActionRow();
		const activateButton = new MessageButton().setLabel('Activate').setCustomId(`___form-activate-${this._id}`).setStyle('PRIMARY');
		const createEntryButton = new MessageButton().setLabel('Create Entry').setCustomId(`___form-create-${this._id}`).setStyle('PRIMARY');
		const deleteButton = new MessageButton().setLabel('Delete').setCustomId(`___form-delete-${this._id}`).setStyle('DANGER');
		const filloutButton = new MessageButton().setLabel('Fill out').setCustomId(`___form-start-${this._id}`).setStyle('PRIMARY');
		switch (type) {
			case 'LIST':
				actionRow.addComponents(createEntryButton);
				break;
			case 'OWNER':
				actionRow.addComponents(activateButton);
				actionRow.addComponents(deleteButton);
				break;
			default:
				actionRow.addComponents(filloutButton);
				break;
		}

		actionRow.addComponents(new MessageButton().setLabel('Get ID').setCustomId(`___form-get-${this._id}`).setStyle('SECONDARY'));
		return [actionRow];
	}
}

export default Form;