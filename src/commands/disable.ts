import { Disclosure, Command, Arguments } from '..';
import { Message } from 'discord.js';

export default class extends Command {
    constructor(client: Disclosure) {
        super(client, {
            name: 'disable',
            description: 'Disables a enabled command.',
            cooldown: 3,
            args: 1,
            usage: ['disable <Command> [...Reason]'],
            aliases: [],
            userPermissions: [],
            clientPermissions: [],
            ownerOnly: true,
            guildOnly: false,
        });
    }

    async execute(message: Message, argv: Arguments) {

        const args = argv._;

        const name = args.shift().toLowerCase();

        const command = this.client.resolveCommand(name);

        if (!command) return message.channel.send(`That command does not exist.`);

        const reason = args.length ? args.join(' ') : 'No reason provided.';

        const status = await this.client.dispatcher.disable(command, reason);

        message.channel.send(`Command \`${command.config.name}\` ${status ? `has been disabled.\nReason: ${reason}` : 'is already disabled.'}`);

    }

}