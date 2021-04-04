import { CollectorFilter, Message } from 'discord.js';
import { Command, Disclosure, DisclosureError, DisclosureTypeError, } from '.';

export type Inhibitor = (m: Message, c: Command) => boolean | Promise<boolean>;

export class Dispatcher {

    constructor(private client: Disclosure) {
        this.awaiting = new Set();
        this.inhibitors = new Set();
        this.listened = false;
    }

    private awaiting: Set<string>;
    private inhibitors: Set<Inhibitor>;
    private listened: boolean;

    addInhibitor(inhibitor: Inhibitor) {
        if (typeof inhibitor !== 'function') throw new DisclosureTypeError('The inhibitor must be a function.');
        if (this.inhibitors.has(inhibitor)) return false;
        this.inhibitors.add(inhibitor);
        return true;
    }

    async inihibit(message: Message, command: Command) {
        for (const inhibitor of this.inhibitors) {
            let status = inhibitor(message, command);
            if (status.constructor.name === 'Promise') status = await status;
            if (status) return true;
        }
        return false;
    }

    removeInhibitor(inhibitor: Inhibitor) {
        if (typeof inhibitor !== 'function') throw new DisclosureTypeError('The inhibitor must be a function.');
        return this.inhibitors.delete(inhibitor);
    }

    private createID(message: Message) {
        return `${message.author.id}:${message.channel.id}`;
    }

    addAwait(message: Message) {
        return this.awaiting.add(this.createID(message));
    }

    hasAwait(message: Message) {
        return this.awaiting.has(this.createID(message));
    }

    delAwait(message: Message) {
        return this.awaiting.delete(this.createID(message));
    }

    shouldHandleMessage(message: Message) {
        if (message.author.bot) return false;
        if (this.hasAwait(message)) return false;
        return true;
    }

    async awaitReply(message: Message, time: number = 60000, filter: CollectorFilter = (m) => m.author.id === message.author.id): Promise<Message | boolean> {
        try {
            this.addAwait(message);
            const collected = await message.channel.awaitMessages(
                filter,
                {
                    max: 1,
                    time,
                    errors: ['time'],
                }
            );
            return collected.first();
        } catch (e) {
            return false;
        } finally {
            this.delAwait(message);
        }
    }

    listen() {
        if (this.listened) throw new DisclosureError(`Dispatcher is already listening`);
        this.listened = true;
        import('./Listener').then(({ Listener }) => {
            const handler = new Listener(this.client);
            this.client.on('message', (message) => handler.exec(message));
        });
    }

}
