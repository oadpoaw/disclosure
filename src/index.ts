import { config } from 'dotenv';
config();

export * from './ArgumentHandler';
export * from './Command';
export * from './Constants';
export * from './Disclosure';
export * from './DisclosureError';
export * from './DiscordEvent';
export * from './Prompt';

import { _scaffold } from './Scaffold';
export const Scaffold = _scaffold;

export * from './Typings';