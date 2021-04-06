import { Disclosure, Command, Arguments } from '..';
import { Message } from 'discord.js';

export default class extends Command {
    constructor(client: Disclosure) {
        super(client, {
            name: 'enable',
            description: 'Enables a disabled command.',
            cooldown: 3,
            args: 1,
            usage: ['enable <Command>'],
            aliases: [],
            userPermissions: [],
            clientPermissions: [],
            ownerOnly: true,
            guildOnly: false,
        });
    }

    async execute(message: Message, argv: Arguments) {

        const name = argv._[0].toLowerCase();

        const command = this.client.resolveCommand(name);

        if (!command) return message.channel.send(`That command does not exist.`);

        const status = await this.client.dispatcher.enable(command);

        message.channel.send(`Command \`${command.config.name}\` ${status ? 'has been enabled.' : 'is already enabled.'}`);

    }

}