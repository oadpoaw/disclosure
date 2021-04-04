import { Message, MessageEmbed, SnowflakeUtil } from 'discord.js';
import { ArgumentError, Command, Disclosure, Scaffold } from '.';
import { ArgumentHandler } from './ArgumentHandler';
import { StoreProvider } from './database/StoreProvider';
import Escapes from '@xetha/escapes';
import ms from 'pretty-ms';

function toProperCase(str: string) {
    return str.replace(/\_/g, '').replace(/(^\w{1})|(\s{1}\w{1})/g, (m) => (m).toUpperCase());
}

export class Listener {

    constructor(private client: Disclosure) {
        this.guilds = client.database('guilds', 'string');
        this.cooldowns = client.database('cooldowns', 'number');
    }

    private guilds: StoreProvider<'string'>;
    private cooldowns: StoreProvider<'number'>;

    private generateKey(command: Command, message: Message) {
        return `${command.config.name}:${message.author.id}`;
    }

    private async throttleHandle(message: Message, command: Command) {

        const expiration = await this.cooldowns.get(this.generateKey(command, message));

        if (expiration) {

            const now = Date.now();

            if (expiration < now) {
                this.cooldowns.del(this.generateKey(command, message));
            } else {
                return message.channel.send(
                    Scaffold.messages.THROTTLE.MESSAGE
                        .replace('${EXPIRATION}', ms(Math.floor(expiration - now)))
                        .replace('${COMMAND_COOLDOWN}', command.config.cooldown.toString())
                );
            }
        }

        return false;

    }

    private throttleExec(message: Message, command: Command) {
        this.cooldowns.set(this.generateKey(command, message), Date.now() + (command.config.cooldown * 1000));
    }

    async exec(message: Message) {

        if (!this.client.dispatcher.shouldHandleMessage(message)) return;

        let prefix = Scaffold.prefix;

        if (message.guild) {
            prefix = await this.guilds.get(message.guild.id) ?? Scaffold.prefix;
        }

        const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${Escapes.regex(prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;

        const [, matchedPrefix] = message.content.match(prefixRegex);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);

        const commandName = args.shift().toLowerCase();
        const command = this.client.resolveCommand(commandName);

        if (!command) return;

        try {

            this.client.dispatcher.addAwait(message);

            if (await this.client.dispatcher.inihibit(message, command)) return;

            if (command.config.ownerOnly && !Scaffold.ownerID.includes(message.author.id)) {
                return message.channel.send(Scaffold.messages.COMMAND.OWNER_ONLY);
            }

            if (command.config.guildOnly && message.channel.type === 'dm') {
                return message.channel.send(Scaffold.messages.COMMAND.GUILD_ONLY);
            }

            if (message.channel.type !== 'dm') {
                if (command.config.clientPermissions &&
                    (
                        !message.guild.me.permissions.has(command.config.clientPermissions) ||
                        !message.channel.permissionsFor(message.guild.me).has(command.config.clientPermissions)
                    )
                ) {
                    return message.channel.send(
                        Scaffold.messages.COMMAND.MISSING_BOT_PERMISSIONS.replace(
                            '${PERMISSIONS}',
                            `${command.config.clientPermissions.map(toProperCase).join(', ')}`
                        )
                    );
                }
                if (command.config.userPermissions &&
                    (
                        !message.guild.me.permissions.has(command.config.userPermissions) ||
                        !message.channel.permissionsFor(message.member).has(command.config.userPermissions)
                    )
                ) {
                    return message.channel.send(
                        Scaffold.messages.COMMAND.MISSING_PERMISSIONS.replace(
                            '${PERMISSIONS}',
                            `${command.config.userPermissions.map(toProperCase).join(', ')}`
                        )
                    );
                }
            }

            if (await this.throttleHandle(message, command)) return;

            if (command.config.args && !args.length) {
                return message.channel.send(
                    Scaffold.messages.COMMAND.NO_ARGUMENTS
                        .replace('${AUTHOR}', message.author.toString())
                        .replace('${USAGE}', command.config.usage.join('\n'))
                );
            } else if (command.config.args && command.config.args > args.length) {
                message.channel.send(
                    Scaffold.messages.COMMAND.NOT_ENOUGH_ARGUMENTS
                        .replace('${USAGE}', command.config.usage.join('\n'))
                );
            }

            const argv = await ArgumentHandler(this.client, message, args, command.config.argsDefinitions);

            if (argv instanceof ArgumentError) return message.channel.send(argv.message);

            let flow: boolean;

            if (typeof command.beforeExecute === 'function') {
                flow = await command.beforeExecute(message, argv);
            }

            flow = await command.execute(message, argv);

            if (flow !== false) this.throttleExec(message, command);

            if (flow !== false && typeof command.afterExecute === 'function') {
                await command.afterExecute(message, argv);
            }

        } catch (err) {

            const errorID = SnowflakeUtil.generate();

            this.client.logger.error(errorID).error(`Error executing command '${command.config.name}'`).error(err);

            const embed = new MessageEmbed()
                .setColor('RED')
                .setTimestamp()
                .setAuthor(`Error executing command ${command.config.name}`)
                .setDescription(`Error ID: \`${errorID}\``);

            if (Scaffold.ownerID.includes(message.author.id)) {
                embed.setDescription(`Error ID: \`${errorID}\`\n\n\`\`\`xl\n${err.stack.substr(0, 256)}\`\`\``);
            }

            message.channel.send(embed);

        } finally {
            this.client.dispatcher.delAwait(message);
        }
    }

}
