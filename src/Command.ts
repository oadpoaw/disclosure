import { Disclosure, Arguments, CommandConfig } from '.';
import { Message } from 'discord.js';

export interface Command {

    /**
     * Run statements when the command is loaded.
     */
    init?(): any | Promise<any>;

    /**
     * Run statements before the command is executed.
     * @returns `true` to execute the command, `false` to cancel the execution of the command
     */
    beforeExecute?(message: Message, argv: Arguments): boolean | Promise<boolean>;

    /**
     * @return `false` to bypass command cooldown
     */
    execute(message: Message, argv: Arguments): any | Promise<any>;

    /**
     * Run statements after the command is executed.
     */
    afterExecute?(message: Message, argv: Arguments): any | Promise<any>;

}

export abstract class Command {

    constructor(
        protected client: Disclosure,
        public config: CommandConfig
    ) { }

}