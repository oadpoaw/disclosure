import { Disclosure } from './Disclosure';
import { ClientEvents } from 'discord.js';

export interface DiscordEvent<T = unknown> {

    /**
     * Run statements when the event is loaded.
     */
    init?(): any;

    /**
     * Run statements when the event is triggered.
     */
    on?(...args: any): any;

    /**
     * Run statements when the event is triggered once.
     */
    once?(...args: any): any;

}

export abstract class DiscordEvent<T = unknown> {

    constructor(
        protected readonly client: Disclosure,
        public readonly eventName: T extends string ? T : keyof ClientEvents
    ) { }

}
