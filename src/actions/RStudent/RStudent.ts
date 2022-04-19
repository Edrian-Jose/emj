import { Message, MessageActionRow, MessageButton } from 'discord.js';
import type { Moment } from 'moment';
import moment from 'moment';
import fieldsForm from '../../components/embeds/fieldsForm';
import rencode from '../../lib/rencode';
import type { IRStudent, Location, RStudentDocument } from '../../schemas/RStudent';
import parseChannel from '../Channel/parseChannel';
import { capFirstLetter } from '../Form/Commands/rlog';

type RSubmitActions = 'trainSubmit' | 'pauseSubmit' | 'delSubmit' | 'endSubmit';
export type RSubActions = 'train' | 'pause' | 'del' | 'end' | RSubmitActions;

class RStudent implements IRStudent {
	_id: string;
	_document: RStudentDocument;
	reference: string;
	removedAt?: number;
	locations?: {
		log: Location;
		information?: Location;
		student?: Location;
		trainee?: Location;
		finished?: Location;
		out?: Location;
	};

	public constructor(doc: RStudentDocument) {
		this._id = doc._id;
		this._document = doc;
		this.reference = doc.reference;
		this.locations = doc.locations;
		this.removedAt = doc.removedAt;
	}

	public createComponents() {
		const addInfoFormId = 'asasas';
		const actionRow = new MessageActionRow();
		const addInfoButton = new MessageButton().setLabel('Add Info').setCustomId(`___form-start-${addInfoFormId}`).setStyle('PRIMARY');
		const traineeButton = new MessageButton().setLabel('Train').setCustomId(`___r-train-${this._id}`).setStyle('PRIMARY');
		const pauseButton = new MessageButton().setLabel('Pause').setCustomId(`___r-pause-${this._id}`).setStyle('SECONDARY');
		const deleteButton = new MessageButton().setLabel('Delete').setCustomId(`___r-del-${this._id}`).setStyle('DANGER');
		const endButton = new MessageButton().setLabel('End').setCustomId(`___r-end-${this._id}`).setStyle('SUCCESS');
		if (!this.locations || !this.locations.information) {
			actionRow.addComponents(addInfoButton);
		}

		if (!this.locations || (this.locations.student && !this.locations.trainee)) {
			actionRow.addComponents(traineeButton);
		}

		if (this.locations && this.locations.trainee && !this.locations.finished) {
			actionRow.addComponents(endButton);
		}

		actionRow.addComponents(pauseButton);

		if (!this.locations || (!this.locations.trainee && !this.locations.finished)) {
			actionRow.addComponents(deleteButton);
		}

		return [actionRow];
	}

	public outComponents() {
		const actionRow = new MessageActionRow();
		const readmitButton = new MessageButton().setLabel('Readmit').setCustomId(`___r-back-${this._id}`).setStyle('SECONDARY');
		actionRow.addComponents(readmitButton);
		return [actionRow];
	}

	public async log(fullname: string, regObject: Moment, ref: string, uri: string, birthdate: string) {
		const [allChannel] = await parseChannel(rencode.guild, rencode.all);
		const dateRegistered = regObject.format('MM/DD/YYYY');
		try {
			if (allChannel?.isText()) {
				return await allChannel.send({
					embeds: [
						fieldsForm(
							`${fullname}`,
							`This information may be irrelevant and can contain errors. Report to the managers if you find one.`,
							['Petsa Itinala', 'Reference Number', 'Buong Pangalan', 'Uri', 'Kapanganakan', 'Encoding Timestamp'],
							[regObject.format('dddd, MMMM Do YYYY'), ref, fullname, uri, birthdate, moment().format('dddd, MMMM Do YYYY HH:mm A')],
							moment().valueOf()
						)
					],
					content: `${ref} (${dateRegistered})`
				});
			}
		} catch (error) {
			console.log(error);
		}
		return undefined;
	}

	public async studentLog(regObject: Moment, referenceNumber: string, fullname: string, givenName: string, lastname: string) {
		const [studsChannel] = await parseChannel(rencode.guild, rencode.students);
		try {
			if (studsChannel?.isText()) {
				return await studsChannel.send({
					embeds: [
						fieldsForm(
							`${fullname}`,
							`This information may be irrelevant and can contain errors. Report to the managers if you find one.`,
							['Reference Number', 'Unang Pangalan', 'Apelyido', 'Dako ng Gawain', 'Oras ng Gawain'],
							[referenceNumber, capFirstLetter(givenName), lastname, '-', '-'],
							regObject.valueOf()
						)
					],
					components: this.createComponents(),
					content: `${referenceNumber}`
				});
			}
		} catch (error) {
			console.log(error);
		}
		return undefined;
	}

	public async register(
		regObject: Moment,
		referenceNumber: string,
		fullname: string,
		givenName: string,
		lastname: string,
		uri: string,
		birthdate: string
	) {
		let logm: Message | undefined;
		let studm: Message | undefined;
		try {
			logm = await this.log(fullname, regObject, referenceNumber, uri, birthdate);
			studm = await this.studentLog(regObject, referenceNumber, fullname, givenName, lastname);
		} catch (error) {
			console.log(error);
		} finally {
			if (logm && studm) {
				return this._document.update({
					$set: {
						locations: {
							log: {
								guildId: rencode.guild,
								channelId: rencode.all,
								messageId: logm.id
							},
							student: {
								guildId: rencode.guild,
								channelId: rencode.students,
								messageId: studm.id
							}
						}
					}
				});
			}
		}
		return undefined;
	}
}

export default RStudent;
