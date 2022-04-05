import { webhooks } from './constants';

export interface Hook {
	name: string;
	avatar: string;
}

const randomHook = async (): Promise<Hook> => {
	return webhooks.random[Math.floor(Math.random() * webhooks.random.length)];
};

export default randomHook;
