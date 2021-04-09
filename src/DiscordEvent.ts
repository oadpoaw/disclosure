import { Disclosure } from './Disclosure';
import { ClientEvents } from 'discord.js';

export interface DiscordEvent<T> {

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

export abstract class DiscordEvent<T> {

    constructor(
        protected readonly client: Disclosure,
        public readonly eventName: T extends string ? T : keyof ClientEvents
    ) { }

}
