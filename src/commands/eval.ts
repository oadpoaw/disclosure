import { Disclosure, Command, Arguments } from '..';
import { Message, MessageEmbed } from 'discord.js';
import Escapes from '@xetha/escapes';

export default class extends Command {
    constructor(client: Disclosure) {
        super(client, {
            name: 'eval',
            description: 'Evaluates Arbitary JavaScript (Must be inside a code block)',
            cooldown: 3,
            args: 1,
            usage: ['eval <...code>'],
            aliases: [],
            userPermissions: [],
            clientPermissions: [],
            ownerOnly: true,
            guildOnly: false,
        });
    }

    get codeblockRegex() {
        return /\`\`\`(([a-z0-9-]+?)\n+)?\n*([^]+?)\n*\`\`\`/i;
    }

    async execute(message: Message, argv: Arguments) {

        const code = this.codeblockRegex.test(message.content) ?
            message.content.match(this.codeblockRegex)[3]
            : argv.__.join(' ');

        try {

            let result = eval(code);

            if (result && result.constructor && result.constructor.name === 'Promise') {
                result = await result;
            }

            return message.channel.send(new MessageEmbed()
                .setColor('GREEN')
                .setTitle(`Javascript Evaluation`)
                .addField(`Code`, `\`\`\`js\n${code.substr(0, 1000)}\n\`\`\``)
                .addField(`Output`, `\`\`\`xl\n${Escapes.backticks((JSON.stringify(result, null, 2).replace(this.client.token, '{DISCORD_TOKEN}'))).substr(0, 1000)}\n\`\`\``)
            );

        } catch (error) {
            return message.channel.send(new MessageEmbed()
                .setColor('RED')
                .setTitle(`Javascript Evaluation`)
                .addField(`Code`, `\`\`\`js\n${code.substr(0, 1000)}\n\`\`\``)
                .addField(`Output`, `\`\`\`xl\n${Escapes.backticks((error.stack ? error.stack.replace(this.client.token, '{DISCORD_TOKEN}') : JSON.stringify(error, null, 2).replace(this.client.token, '{DISCORD_TOKEN}'))).substr(0, 1000)}\n\`\`\``)
            );
        }
    }

}