import { Message } from 'discord.js';
import minimist from 'minimist';
import builder, { Options as MinimistOptions } from 'minimist-options';
import { ArgsDefinition, ExtractData, Disclosure, DataType } from '.';

export class ArgumentError {

    constructor(public key: string, public value: any, public must: DataType) { }

    getMessage() {

        if (typeof this.value === 'undefined') {
            return `Missing '${this.must}' in parameter '--${this.key}'`;
        }

        return `Incorrect value for parameter '--${this.key}', gotten a type of '${typeof this.value}' instead of '${this.must}'`;

    }

}

export async function ArgumentHandler<T extends ArgsDefinition>(client: Disclosure, message: Message, args: string[], definitions: T) {

    if (typeof definitions !== 'object') definitions = {} as T;

    const options: MinimistOptions = {
        arguments: 'string',
    };

    for (const key in definitions) {
        options[key] = {
            type: ['string', 'boolean', 'number'].includes(definitions[key].type) ? definitions[key].type as 'string' | 'boolean' | 'number' : 'string',
            alias: definitions[key].alias ?? [],
        };
    }

    const retval = minimist(args, builder(options)) as ExtractData<T>;

    let error: ArgumentError = undefined;

    for (const key in definitions) {

        const definition = definitions[key];

        let content: any = retval[key];

        if (typeof content === 'undefined') content = definition.default ?? undefined;

        if (typeof content === 'undefined') {
            error = new ArgumentError(key, content, definition.type);
            break;
        }

        if (definition.type === 'string') {
            if (typeof content !== 'string') {
                error = new ArgumentError(key, content, definition.type);
                break;
            }
        }

        if (definition.type === 'boolean') {
            if (typeof content !== 'boolean') {
                error = new ArgumentError(key, content, definition.type);
                break;
            }
        }

        if (definition.type === 'number') {
            if (typeof content !== 'number') {
                error = new ArgumentError(key, content, definition.type);
                break;
            }
        }

        if (typeof content === 'string') {
            if (definition.type === 'User') {
                const user = await client.resolveUser(content);
                if (!user) {
                    error = new ArgumentError(key, content, definition.type);
                    break;
                }
                content = user;
            }

            if (definition.type === 'Role') {
                const role = client.resolveRole(content, message.guild);
                if (!role) {
                    error = new ArgumentError(key, content, definition.type);
                    break;
                }
                content = role;
            }

            if (definition.type === 'TextChannel') {
                const channel = client.resolveChannel(content, message.guild);
                if (!channel || channel.type !== 'text') {
                    error = new ArgumentError(key, content, definition.type);
                    break;
                }
                content = channel;
            }

            if (definition.type === 'VoiceChannel') {
                const channel = client.resolveChannel(content, message.guild);
                if (!channel || channel.type !== 'voice') {
                    error = new ArgumentError(key, content, definition.type);
                    break;
                }
                content = channel;
            }

            if (definition.type === 'CategoryChannel') {
                const channel = client.resolveChannel(content, message.guild);
                if (!channel || channel.type !== 'category') {
                    error = new ArgumentError(key, content, definition.type);
                    break;
                }
                content = channel;
            }

            if (definition.type === 'Command') {
                const command = client.resolveCommand(content);
                if (!command) {
                    error = new ArgumentError(key, content, definition.type);
                    break;
                }
                content = command;
            }
        }

        retval[key] = content;

    }

    return error ?? retval;


}