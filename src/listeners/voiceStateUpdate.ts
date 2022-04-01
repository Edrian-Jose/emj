import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { VoiceState } from 'discord.js';
import voiceGenerator from '../actions/Channel/voiceGenerator';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldState: VoiceState, newState: VoiceState) {
		await voiceGenerator(oldState, newState);
	}
}
