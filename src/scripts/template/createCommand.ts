import { prompt } from 'inquirer';
import { promises as fs, lstatSync, existsSync } from 'fs';
import path from 'path';
import { ParsedArgs } from 'minimist';
import { PermissionString } from 'discord.js';
import { Scaffold } from '../..';

function createCommandString(data: any) {

    const {
        name, description, userPermissions,
        clientPermissions, args, usage,
        cooldown, ownerOnly, guildOnly
    } = data;

    return `import { Disclosure, Command, Arguments } from 'disclosure-discord';
import { Message } from 'discord.js';

export default class extends Command {
    constructor(client: Disclosure)  {
        super(client, {
            name: '${name}',
            description: '${description.replace(/\'/g, '\\\'')}',
            cooldown: ${cooldown},
            args: ${args},
            usage: ['${usage.replace(/\'/g, '\\\'')}'],
            aliases: [],
            userPermissions: [${userPermissions.length ? userPermissions.map((p: string) => `'${p}'`).join(', ') : ''}],
            clientPermissions: [${clientPermissions.length ? clientPermissions.map((p: string) => `'${p}'`).join(', ') : ''}],
            ownerOnly: ${ownerOnly ? 'true' : 'false'},
            guildOnly: ${guildOnly ? 'true' : 'false'},
        });
    }

    async execute(message: Message, argv: Arguments) {

    }

}`;
}

const permissions: PermissionString[] = [
    'CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS',
    'ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_GUILD',
    'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER',
    'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES',
    'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS',
    'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS'
];

export async function createCommand(argv: ParsedArgs) {
    Scaffold();

    console.log('Command:');
    const answers = await prompt([
        {
            type: 'input',
            message: 'Name',
            name: 'name',
        },
        {
            type: 'input',
            message: 'Description',
            name: 'description',
        },
        {
            type: 'input',
            message: 'Usage',
            name: 'usage',
            default: '',
        },
        {
            type: 'number',
            message: 'Arguments (number of required arguments)',
            name: 'args',
            default: 0,
        },
        {
            type: 'number',
            message: 'Cooldown (in seconds)',
            name: 'cooldown',
            default: 3,
        },
        {
            type: 'checkbox',
            message: 'Client Permissions',
            name: 'clientPermissions',
            default: [],
            choices: permissions,
        },
        {
            type: 'checkbox',
            message: 'User Permissions',
            name: 'userPermissions',
            default: [],
            choices: permissions,
        },
        {
            type: 'confirm',
            message: 'Owner Only Command?',
            name: 'ownerOnly',
            default: false,
        },
        {
            type: 'confirm',
            message: 'Guild Only Command?',
            name: 'guildOnly',
            default: false,
        }
    ]);

    answers.name = answers.name.toLowerCase();

    if (!Array.isArray(answers.userPermissions)) answers.userPermissions = [answers.userPermission];
    if (!Array.isArray(answers.clientPermissions)) answers.clientPermissions = [answers.clientPermission];

    const ipath = path.join(process.cwd(), 'src', 'commands');
    const choices = (await fs.readdir(ipath)).filter((dir) => lstatSync(path.join(ipath, dir)).isDirectory());

    const { category } = await prompt([
        {
            type: 'list',
            message: 'Select Category',
            name: 'category',
            choices: ['none', ...choices],
        }
    ]);

    const opath = path.join(
        process.cwd(),
        'src',
        'commands',
        category !== 'none' ? category : '',
        `${answers.name}.ts`
    );

    if (existsSync(opath) && !argv.force) {
        console.error(`A command named '${answers.name}' already exists.`);
        process.exit(1);
    } else {

        await fs.writeFile(
            opath,
            createCommandString(answers),
            'utf-8'
        );

        console.log('Command created!');

    }
}
