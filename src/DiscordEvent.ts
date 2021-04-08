import { Disclosure } from './Disclosure';
import { ClientEvents } from 'discord.js';

export interface DiscordEvent {

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

export abstract class DiscordEvent {

    constructor(
        protected readonly client: Disclosure,
        public readonly eventName: keyof ClientEvents
    ) { }

}