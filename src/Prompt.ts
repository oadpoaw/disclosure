import { Message } from 'discord.js';
import ms from 'pretty-ms';
import { Disclosure } from '.';
import { ExtractData, Prompts } from '.';

export function StringToBoolean(str: string) {
    if (['true', 'yes', 'y'].includes(str.toLowerCase())) return true;
    else if (['false', 'no', 'n'].includes(str.toLowerCase())) return false;
    return undefined;
}

export async function Prompt<T extends Prompts>(client: Disclosure, message: Message, prompts: T): Promise<ExtractData<T> | undefined> {

    const retval = {} as ExtractData<T>;

    let status = false;

    for (const key in prompts) {

        const opts = prompts[key];

        await message.channel.send(opts.message);

        const timeout = opts.timeout && opts.timeout.duration ? opts.timeout.duration : 60000;
        const timeout_message = opts.timeout && opts.timeout.message ? opts.timeout.message : 'You did not reply within **${TIMEOUT}**\n\nPlease try again.';

        const msg = await client.awaitReply(message, timeout);

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
                await message.channel.send(`Sorry, it should be a valid boolean\nIt's either \`true\`, \`false\`, \`yes\`, \`no\`, \`y\`, \`n\`\n\nPlease try again.`);
                status = false;
                break;
            }

            content = bool;

        } else if (opts.type === 'number') {

            const num = Number(msg.content);

            if (Number.isNaN(num)) {
                await message.channel.send('Sorry, it should be a valid Number\n\nPlease try again.');
                status = false;
                break;
            }

            content = num;

        } else if (opts.type === 'User') {

            const user = await client.resolveUser(msg.content);

            if (!user) {
                await message.channel.send("Sorry, it should be a valid User\n\nYou can type the User's ID, Username, Tag or you can even mention the User.\n\nPlease try again.");
                status = false;
                break;
            }

            content = user;

        } else if (opts.type === 'Role') {

            const role = client.resolveRole(msg.content, message.guild);

            if (!role) {
                await message.channel.send("Sorry, it should be a valid Role\n\nYou can type the Role's ID, Name or you can even mention the Role.\n\nPlease try again.");
                status = false;
                break;
            }

            content = role;

        } else if (opts.type === 'TextChannel') {

            const channel = client.resolveChannel(msg.content, message.guild);

            if (!channel || channel.type !== 'text') {
                await message.channel.send("Sorry, it should be a valid Text Channel\n\nYou can type the Text Channel's ID, Name or you can even mention the text channel.\n\nPlease try again.");
                status = false;
                break;
            }

            content = channel;

        } else if (opts.type === 'VoiceChannel') {

            const channel = client.resolveChannel(msg.content, message.guild);

            if (!channel || channel.type !== 'voice') {
                await message.channel.send("Sorry, it should be a valid Voice Channel\n\nYou can type the Voice Channel's ID or Name\n\nPlease try again.");
                status = false;
                break;
            }

            content = channel;

        } else if (opts.type === 'CategoryChannel') {

            const channel = client.resolveChannel(msg.content, message.guild);

            if (!channel || channel.type !== 'category') {
                await message.channel.send("Sorry, it should be a valid Category Channel\n\nYou can type the Category Channel's ID or Name\n\nPlease try again.");
                status = false;
                break;
            }

            content = channel;

        } else if (opts.type === 'Command') {

            const command = client.resolveCommand(msg.content.toLowerCase());

            if (!command) {
                await message.channel.send("Sorry, it should be a valid Command\n\nYou can type the Command's name or some of it's aliases\n\nPlease try again.");
                status = false;
                break;
            }

            content = command;

        }

        retval[key] = content;

        if (opts.validation && opts.validation.validate) {

            const valid = await opts.validation.validate(content);

            if (!valid) {
                await message.channel.send(opts.validation.errorMsg);
                status = false;
                break;
            }

        }

        status = true;

    }

    return status ? retval : undefined;

}