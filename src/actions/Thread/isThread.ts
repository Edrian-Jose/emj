import type { ChannelTypeString } from '@sapphire/discord.js-utilities';

export const threadTypesString = ['GUILD_NEWS_THREAD', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'];
const isThread = (channelType: ChannelTypeString) => threadTypesString.includes(channelType);

export default isThread;
