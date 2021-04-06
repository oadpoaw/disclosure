import { Message } from 'discord.js';
import minimist from 'minimist';
import builder, { Options } from 'minimist-options';
import { ArgsDefinition, ExtractData, Disclosure, ArgumentError } from '.';

export async function ArgumentHandler<T extends ArgsDefinition>(client: Disclosure, message: Message, args: string[], definitions: T) {

    if (typeof definitions !== 'object') definitions = {} as T;

    const options: Options = {
        arguments: 'string',
    };

    for (const key in definitions) {
        options[key] = {
            type: ['string', 'boolean', 'number'].includes(definitions[key].type) ? definitions[key].type as 'string' | 'boolean' | 'number' : 'string',
            alias: definitions[key].alias ?? [],
        };
    }

    /**
     * If the user passed `--__proto__` it will throw an error.
     * So this is a work around to counter it.
     * 
     * This is called Prototype Pollution
     * 
     * See {@link https://medium.com/node-modules/what-is-prototype-pollution-and-why-is-it-such-a-big-deal-2dd8d89a93c}
     */
    args = args.filter((arg) => arg !== '--__proto__');

    const retval = minimist(args, builder(options)) as ExtractData<T> & { _: string[]; __: string[]; };

    let error: ArgumentError = undefined;

    for (const key in definitions) {

        const definition = definitions[key];

        let content: any = retval[key];

        //@ts-ignore
        if (typeof content === 'undefined' && typeof definition.default !== 'undefined') {
            //@ts-ignore
            content = definition.default ?? undefined;
        }

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

        //@ts-ignore
        if (typeof definition.validate === 'function' && ! await definition.validate(content, message)) {
            break;
        }

        retval[key] = content;

    }

    if (!error) retval.__ = args;

    return error ?? retval;

}