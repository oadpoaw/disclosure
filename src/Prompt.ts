import { Message } from 'discord.js';
import ms from 'pretty-ms';
import { Disclosure, ExtractData, Prompts } from '.';

export function StringToBoolean(str: string) {
    if (['true', 'yes', 'y'].includes(str.toLowerCase())) return true;
    else if (['false', 'no', 'n'].includes(str.toLowerCase())) return false;
    return undefined;
}

/**
 * Prompts a discord user with predefined questions with ease.
 * 
 * @returns `undefined` if the prompting failed.
 */
export async function Prompt<T extends Prompts>(client: Disclosure, message: Message, prompts: T): Promise<ExtractData<T> | undefined> {

    const retval = {} as ExtractData<T>;

    let status = false;

    for (const key in prompts) {

        const opts = prompts[key];

        await message.channel.send(opts.message);

        const timeout = opts.timeout && opts.timeout.duration ? opts.timeout.duration : 60000;
        const timeout_message = opts.timeout && opts.timeout.message ? opts.timeout.message : client.config.messages.PROMPT.TIMEOUT;

        const msg = await client.dispatcher.awaitReply(message, timeout);

        if (typeof msg === 'boolean') {
            await message.channel.send(timeout_message.replace('${TIMEOUT}', ms(timeout)));
            status = false;
            break;
        }

        let content: any = message.content;

        if (opts.type === 'string') {

            content = msg.content;

        } else if (opts.type === 'boolean') {

            const bool = StringToBoolean(msg.content);

            if (typeof bool !== 'boolean') {
                await message.channel.send(client.config.messages.PROMPT.ERRORS.BOOLEAN);
                status = false;
                break;
            }

            content = bool;

        } else if (opts.type === 'number') {

            const num = Number(msg.content);

            if (Number.isNaN(num)) {
                await message.channel.send(client.config.messages.PROMPT.ERRORS.NUMBER);
                status = false;
                break;
            }

            content = num;

        } else if (opts.type === 'User') {

            const user = await client.resolveUser(msg.content);

            if (!user) {
                await message.channel.send(client.config.messages.PROMPT.ERRORS.USER);
                status = false;
                break;
            }

            content = user;

        } else if (opts.type === 'Role') {

            const role = client.resolveRole(msg.content, message.guild);

            if (!role) {
                await message.channel.send(client.config.messages.PROMPT.ERRORS.ROLE);
                status = false;
                break;
            }

            content = role;

        } else if (opts.type === 'TextChannel') {

            const channel = client.resolveChannel(msg.content, message.guild);

            if (!channel || channel.type !== 'text') {
                await message.channel.send(client.config.messages.PROMPT.ERRORS.TEXT_CHANNEL);
                status = false;
                break;
            }

            content = channel;

        } else if (opts.type === 'VoiceChannel') {

            const channel = client.resolveChannel(msg.content, message.guild);

            if (!channel || channel.type !== 'voice') {
                await message.channel.send(client.config.messages.PROMPT.ERRORS.VOICE_CHANNEL);
                status = false;
                break;
            }

            content = channel;

        } else if (opts.type === 'CategoryChannel') {

            const channel = client.resolveChannel(msg.content, message.guild);

            if (!channel || channel.type !== 'category') {
                await message.channel.send(client.config.messages.PROMPT.ERRORS.CATEGORY_CHANNEL);
                status = false;
                break;
            }

            content = channel;

        } else if (opts.type === 'Command') {

            const command = client.resolveCommand(msg.content.toLowerCase());

            if (!command) {
                await message.channel.send(client.config.messages.PROMPT.ERRORS.COMMAND);
                status = false;
                break;
            }

            content = command;

        }

        retval[key] = content;

        //@ts-ignore
        if (typeof opts.validate === 'function' && ! await opts.validate(content, message)) {
            status = false;
            break;
        }

        status = true;

    }

    return status ? retval : undefined;

}