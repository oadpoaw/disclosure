import { Message, MessageEmbed, SnowflakeUtil } from 'discord.js';
import { ArgumentError, Command, Disclosure, DisclosureTypeError, } from '.';
import { StoreProvider } from './database/StoreProvider';
import Escapes from '@xetha/escapes';
import ms from 'pretty-ms';
import { ArgumentHandler } from './ArgumentHandler';

export type Inhibitor = (m: Message, c: Command) => boolean | Promise<boolean>;

export class Dispatcher {

    constructor(private client: Disclosure) {

        this.awaiting = new Set();
        this.inhibitors = new Set();

        this.guilds = client.database('guilds', 'string');
        this.cooldowns = client.database('cooldowns', 'number');

        client.on('message', (message) => this.exec(message));

    }

    private readonly awaiting: Set<string>;
    private readonly inhibitors: Set<Inhibitor>;

    /**
     * Cooldowns stored as
     * `key: number`
     * 
     * Key is generated like
     * ```js
     * const key = `${command.config.name}:${message.author.id}`
     * ```
     * 
     */
    public readonly cooldowns: StoreProvider<'number'>;

    /**
     * Guild prefixes stored as
     * `key: string`
     */
    public readonly guilds: StoreProvider<'string'>;

    /**
     * 
     * @param inhibitor Return `true` to continue executing the command. Return `false` to discontinue executing the command.
     */
    addInhibitor(inhibitor: Inhibitor) {
        if (typeof inhibitor !== 'function') throw new DisclosureTypeError('The Inhibitor must be a function.');
        if (this.inhibitors.has(inhibitor)) return false;
        this.inhibitors.add(inhibitor);
        return true;
    }

    removeInhibitor(inhibitor: Inhibitor) {
        if (typeof inhibitor !== 'function') throw new DisclosureTypeError('The Inhibitor must be a function.');
        return this.inhibitors.delete(inhibitor);
    }

    async awaitReply(message: Message, time: number = 60000): Promise<Message | boolean> {
        try {

            this.addAwait(message.author.id);

            const collected = await message.channel.awaitMessages(
                (m) => m.author.id === message.author.id,
                {
                    max: 1,
                    time,
                    errors: ['time'],
                }
            );

            return collected.first();

        } catch (e) {

            return false;

        } finally {

            this.delAwait(message.author.id);

        }
    }

    private async inihibit(message: Message, command: Command) {
        for (const inhibitor of this.inhibitors) {
            let status = inhibitor(message, command);
            if (status.constructor.name === 'Promise') status = await status;
            if (!status) return true;
        }
        return false;
    }

    private generateKey(command: Command, message: Message) {
        return `${command.config.name}:${message.author.id}`;
    }

    private addAwait(id: string) {
        return this.awaiting.add(id);
    }

    private hasAwait(id: string) {
        return this.awaiting.has(id);
    }

    private delAwait(id: string) {
        return this.awaiting.delete(id);
    }

    private shouldHandleMessage(message: Message) {
        if (message.partial) return false;
        if (message.author.bot) return false;
        if (this.hasAwait(message.author.id)) return false;
        return true;
    }

    private async throttleHandle(message: Message, command: Command) {

        const expiration = await this.cooldowns.get(this.generateKey(command, message));

        if (expiration) {

            const now = Date.now();

            if (expiration < now) {
                this.cooldowns.del(this.generateKey(command, message));
            } else {
                return message.channel.send(
                    this.client.config.messages.THROTTLE.MESSAGE
                        .replace('${EXPIRATION}', ms(Math.floor(expiration - now)))
                        .replace('${COMMAND_COOLDOWN}', command.config.cooldown.toString())
                );
            }
        }

        return false;

    }

    private async throttleExec(message: Message, command: Command) {
        await this.cooldowns.set(this.generateKey(command, message), Date.now() + (command.config.cooldown * 1000));
    }

    private async exec(message: Message) {

        if (this.shouldHandleMessage(message)) {

            let prefix = this.client.config.prefix;

            if (message.guild) {
                prefix = await this.guilds.get(message.guild.id) ?? this.client.config.prefix;
            }

            const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${Escapes.regex(prefix)})\\s*`);
            if (!prefixRegex.test(message.content)) return;

            const [, matchedPrefix] = message.content.match(prefixRegex);
            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);

            const commandName = args.shift().toLowerCase();
            const command = this.client.resolveCommand(commandName);

            if (!command) return;

            this.addAwait(message.author.id);

            if (command.config.ownerOnly && !this.client.config.ownerID.includes(message.author.id)) {
                return message.channel.send(this.client.config.messages.COMMAND.OWNER_ONLY);
            }

            if (command.config.guildOnly && message.channel.type === 'dm') {
                return message.channel.send(this.client.config.messages.COMMAND.GUILD_ONLY);
            }

            if (message.channel.type !== 'dm') {
                if (command.config.clientPermissions &&
                    (
                        !message.guild.me.permissions.has(command.config.clientPermissions) ||
                        !message.channel.permissionsFor(message.guild.me).has(command.config.clientPermissions)
                    )
                ) {
                    return message.channel.send(
                        this.client.config.messages.COMMAND.MISSING_BOT_PERMISSIONS.replace(
                            '${PERMISSIONS}',
                            `${command.config.clientPermissions.map((name) => name.replace(/\_/g, '').replace(/(^\w{1})|(\s{1}\w{1})/g, (m) => (m).toUpperCase())).join(', ')}`
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
                        this.client.config.messages.COMMAND.MISSING_PERMISSIONS.replace(
                            '${PERMISSIONS}',
                            `${command.config.userPermissions.map((name) => name.replace(/\_/g, '').replace(/(^\w{1})|(\s{1}\w{1})/g, (m) => (m).toUpperCase())).join(', ')}`
                        )
                    );
                }
            }

            try {

                if (await this.throttleHandle(message, command)) return;

                if (command.config.args && !args.length) {
                    return message.channel.send(
                        this.client.config.messages.COMMAND.NO_ARGUMENTS
                            .replace('${AUTHOR}', message.author.toString())
                            .replace('${USAGE}', command.config.usage.join('\n'))
                    );
                } else if (command.config.args && command.config.args > args.length) {
                    message.channel.send(
                        this.client.config.messages.COMMAND.NOT_ENOUGH_ARGUMENTS
                            .replace('${USAGE}', command.config.usage.join('\n'))
                    );
                }

                const argv = await ArgumentHandler(this.client, message, args, command.config.argsDefinitions);

                if (argv instanceof ArgumentError) return message.channel.send(argv.message);

                if (await this.inihibit(message, command)) return;

                let flow: boolean = true;

                if (typeof command.beforeExecute === 'function') {
                    flow = await command.beforeExecute(message, argv);
                }

                if (flow) {
                    flow = await command.execute(message, argv);
                }

                if (flow !== false) {
                    await this.throttleExec(message, command);
                }

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

                if (this.client.config.ownerID.includes(message.author.id)) {
                    embed.setDescription(`Error ID: \`${errorID}\`\n\n\`\`\`xl\n${err.stack.substr(0, 256)}\`\`\``);
                }

                message.channel.send(embed);

            } finally {
                this.delAwait(message.author.id);
            }
        }
    }
}
