import { Disclosure, Command } from '..';
import { Message } from 'discord.js';

export default class extends Command {
    constructor(client: Disclosure) {
        super(client, {
            name: 'ping',
            description: 'Determine the Bot\'s latency to discord',
            cooldown: 5,
            args: 0,
            usage: ['ping'],
            aliases: [],
            userPermissions: [],
            clientPermissions: [],
            ownerOnly: false,
            guildOnly: false,
        });
    }

    async execute(message: Message) {

        const msg = await message.channel.send(`Ping?`);

        await msg.edit(`Pong!\nLatency: \`${Math.round(msg.createdTimestamp - message.createdTimestamp)}ms\`\nWebSocket API Latency :\`${Math.round(this.client.ws.ping)}ms\``);

    }

}