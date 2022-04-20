import { Message, MessageActionRow, MessageButton } from 'discord.js';
import type { Moment } from 'moment';
import moment from 'moment';
import answersForm from '../../components/embeds/answersForm';
import fieldsForm from '../../components/embeds/fieldsForm';
import rencode from '../../lib/rencode';
import type { IRStudent, Location, RStatus, RStudentDocument } from '../../schemas/RStudent';
import parseChannel from '../Channel/parseChannel';
import { capFirstLetter } from '../Form/Commands/rlog';
import type { EntryAnswer } from '../Form/handleFormCommand';

type RSubmitActions = 'trainSubmit' | 'pauseSubmit' | 'delSubmit' | 'endSubmit';
export type RSubActions = 'train' | 'pause' | 'del' | 'end' | RSubmitActions;

class RStudent implements IRStudent {
	_id: string;
	_document: RStudentDocument;
	reference: string;
	registeredAt: number;
	removedAt?: number;
	status: RStatus;
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
		this.registeredAt = doc.registeredAt;
		this.status = doc.status;
	}

	public createComponents() {
		const addInfoFormId = '625f947b83661901c01add23';
		const type = this.locations && this.locations.trainee ? 'trainee' : 'student';
		const actionRow = new MessageActionRow();
		const addInfoButton = new MessageButton().setLabel('Add Info').setCustomId(`___form-start-${addInfoFormId}`).setStyle('PRIMARY');
		const traineeButton = new MessageButton().setLabel('Train').setCustomId(`___r-train-${this._id}`).setStyle('PRIMARY');
		const pauseButton = new MessageButton().setLabel('Pause').setCustomId(`___r-pause-${this._id}-${type}`).setStyle('SECONDARY');
		const deleteButton = new MessageButton().setLabel('Delete').setCustomId(`___r-del-${this._id}`).setStyle('DANGER');
		const endButton = new MessageButton().setLabel('End').setCustomId(`___r-end-${this._id}`).setStyle('SUCCESS');
		if (!this.locations || !this.locations.information) {
			actionRow.addComponents(addInfoButton);
		}

		if (this.status === 'student') {
			actionRow.addComponents(traineeButton);
		}

		if (this.status === 'trainee') {
			actionRow.addComponents(endButton);
		}

		actionRow.addComponents(pauseButton);

		if (!this.locations || (!this.locations.trainee && !this.locations.finished)) {
			actionRow.addComponents(deleteButton);
		}

		return [actionRow];
	}

	public async dropOut(dateObject: Moment, fullname: string, referenceNumber: string, uri: string, reason: string) {
		const [outChannel] = await parseChannel(rencode.guild, rencode.out);
		try {
			if (outChannel?.isText()) {
				return await outChannel.send({
					embeds: [
						fieldsForm(
							`${fullname}`,
							`This information may be irrelevant and can contain errors. Report to the managers if you find one.`,
							['Petsa Itinigil', 'Reference Number', 'Buong Pangalan', 'Uri', 'Dahilan'],
							[dateObject.utcOffset(8).format('MM/DD/YYYY'), referenceNumber, fullname, uri, reason],
							dateObject.valueOf()
						)
					],
					components: this.outComponents(),
					content: `${referenceNumber}`
				});
			}
		} catch (error) {
			console.log(error);
		}
		return undefined;
	}

	public outComponents() {
		const actionRow = new MessageActionRow();
		const readmitButton = new MessageButton().setLabel('Readmit').setCustomId(`___r-back-${this._id}`).setStyle('SECONDARY');
		actionRow.addComponents(readmitButton);
		return [actionRow];
	}

	public async train(regObject: Moment, referenceNumber: string, fullname: string, givenName: string, lastname: string) {
		const [traineeChannel] = await parseChannel(rencode.guild, rencode.trainee);
		try {
			if (traineeChannel?.isText()) {
				return await traineeChannel.send({
					embeds: [
						fieldsForm(
							`${fullname}`,
							`This information may be irrelevant and can contain errors. Report to the managers if you find one.`,
							['Reference Number', 'Unang Pangalan', 'Apelyido', 'Petsa ng Screening', 'Requirements'],
							[referenceNumber, capFirstLetter(givenName), capFirstLetter(lastname), regObject.utcOffset(8).format('MM/DD/YYYY'), '-'],
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
							[referenceNumber, capFirstLetter(givenName), capFirstLetter(lastname), '-', '-'],
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

	public async info(fullname: string, answers: EntryAnswer[]) {
		const [infoChannel] = await parseChannel(rencode.guild, rencode.information);
		try {
			if (infoChannel?.isText()) {
				return await infoChannel.send({
					embeds: [
						answersForm(
							`${fullname}`,
							`This information may be irrelevant and can contain errors. Report to the managers if you find one.`,
							answers
						)
					],
					content: `${this.reference}`
				});
			}
		} catch (error) {
			console.log(error);
		}
		return undefined;
	}
}

export default RStudent;
