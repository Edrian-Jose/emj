import parseMember from '../actions/Member/parseMember';
import WebhookModel from '../schemas/Webhook';
import { webhooks } from './constants';

export interface Hook {
	name: string;
	avatar: string;
}

const randomHook = async (): Promise<Hook> => {
	const count = await WebhookModel.count().exec();
	let rhook: Hook = webhooks.random[Math.floor(Math.random() * webhooks.random.length)];
	try {
		if (count) {
			const random = Math.floor(Math.random() * count);
			const hook = await WebhookModel.findOne().skip(random).exec();

			if (hook) {
				if (hook.isImpersonation) {
					if (hook.impersonation) {
						const [member] = await parseMember(hook.impersonation.guildId, hook.impersonation.memberId);
						if (member) {
							rhook = {
								name: member.displayName,
								avatar: member.displayAvatarURL()
							};
						}
					}
				}
				if (hook.username && hook.avatar) {
					rhook = {
						name: hook.username,
						avatar: hook.avatar
					};
				}
			}
		}
	} catch (error) {
		console.log(error);
	} finally {
		return rhook;
	}
};

export default randomHook;
