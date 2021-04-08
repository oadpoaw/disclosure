import { Collection, Message, MessageEmbed, SnowflakeUtil } from 'discord.js';
import { ArgumentError, Command, Disclosure, Arguments } from '.';
import { StoreProvider } from './database/StoreProvider';
import Escapes from '@xetha/escapes';
import ms from 'pretty-ms';
import { ArgumentHandler } from './ArgumentHandler';

export type Inhibitor = (m: Message, c: Command, args: string[]) => boolean | Promise<boolean>;
export type PrefixGenerator = (m: Message) => string | Promise<string>;
export type CooldownKeyGenerator = (m: Message, c: Command) => string;

export class Dispatcher {

    constructor(private client: Disclosure) {

        this.awaiting = new Set();
        this.cache = new Collection();
        this.inhibitors = new Set();

        this.DisabledCommands = client.database('commands', 'string');
        this.cooldowns = client.database('cooldowns', 'number');
        this.guilds = client.database('guilds', 'string');

        client.on('message', (message) => this.exec(message));

        this.addInhibitor((message, command) => {
            const reason = this.check(command);
            if (reason) {
                message.channel.send(this.client.config.messages.COMMAND.COMMAND_DISABLED.replace(/\${REASON}/, reason));
                return false;
            }
            return true;
        }, 5);

        this.addInhibitor((message, command) => {
            if (command.config.ownerOnly && !this.client.config.ownerID.includes(message.author.id)) {
                message.channel.send(this.client.config.messages.COMMAND.OWNER_ONLY);
                return false;
            }
            return true;
        }, 4);

        this.addInhibitor((message, command) => {
            if (command.config.guildOnly && message.channel.type === 'dm') {
                message.channel.send(this.client.config.messages.COMMAND.GUILD_ONLY);
                return false;
            }
            return true;
        }, 3);

        this.addInhibitor((message, command) => {
            if (message.channel.type !== 'dm') {
                if (command.config.clientPermissions &&
                    (
                        !message.guild.me.permissions.has(command.config.clientPermissions) ||
                        !message.channel.permissionsFor(message.guild.me).has(command.config.clientPermissions)
                    )
                ) {
                    message.channel.send(
                        this.client.config.messages.COMMAND.MISSING_BOT_PERMISSIONS.replace(
                            '${PERMISSIONS}',
                            `${command.config.clientPermissions
                                .map((name) => name.replace(/\_/g, ' ').replace(/(^\w{1})|(\s{1}\w{1})/g, (m) => (m).toUpperCase()))
                                .join(', ')
                            }`
                        )
                    );
                    return false;
                }
                if (command.config.userPermissions &&
                    (
                        !message.guild.me.permissions.has(command.config.userPermissions) ||
                        !message.channel.permissionsFor(message.member).has(command.config.userPermissions)
                    )
                ) {
                    message.channel.send(
                        this.client.config.messages.COMMAND.MISSING_PERMISSIONS.replace(
                            '${PERMISSIONS}',
                            `${command.config.userPermissions
                                .map((name) => name.replace(/\_/g, ' ').replace(/(^\w{1})|(\s{1}\w{1})/g, (m) => (m).toUpperCase()))
                                .join(', ')
                            }`
                        )
                    );
                    return false;
                }
            }
            return true;
        }, 2);

        this.addInhibitor((message, command, args) => {
            if (command.config.args && !args.length) {
                message.channel.send(
                    this.client.config.messages.COMMAND.NO_ARGUMENTS
                        .replace('${AUTHOR}', message.author.toString())
                        .replace('${USAGE}', `**${command.config.usage.join('\n')}**`)
                );
                return false;
            } else if (command.config.args && command.config.args > args.length) {
                message.channel.send(
                    this.client.config.messages.COMMAND.NOT_ENOUGH_ARGUMENTS
                        .replace('${USAGE}', `**${command.config.usage.join('\n')}**`)
                );
                return false;
            }
            return true;
        }, 1);

        this.generators = {
            prefix: async (message) => {
                let prefix = this.client.config.prefix;
                if (message.guild) {
                    prefix = await this.guilds.get(message.guild.id) ?? this.client.config.prefix;
                }
                if (typeof prefix !== 'string') {
                    prefix = this.client.config.prefix;
                }
                return prefix;
            },
            cooldown: (message, command) => {
                return `${command.config.name}:${message.author.id}`;
            }
        };

        this.client.on('command', async (data: ['enable' | 'disable', string]) => {
            if (data[0] === 'enable') {
                this.cache.delete(data[1]);
            } else if (data[0] === 'disable') {
                this.cache.set(data[1], await this.DisabledCommands.get(data[1]));
            }
        });

    }

    /**
     * storage for the user awaiting
     */
    private readonly awaiting: Set<string>;

    /** storage for the disabled commands */
    private readonly cache: Collection<string, string>;

    /** storage for the inhibitors */
    private readonly inhibitors: Set<[Inhibitor, number]>;

    private readonly DisabledCommands: StoreProvider<'string'>

    /**
     * Generators for flexibility on editing how would the dispatcher will get the prefix, to store cooldowns etc.
     */
    public readonly generators: {

        /**
         * The Bot Prefix generator. Useful for per guild prefixes.
         * 
         * 
         * @default
         * ```js
         * (message) => {
         *      let prefix = this.client.config.prefix;
         *      if (message.guild) {
         *          prefix = await this.guilds.get(message.guild.id) ?? this.client.config.prefix;
         *      }
         *      if (typeof prefix !== 'string') {
         *          prefix = this.client.config.prefix;
         *      }
         *      return prefix;
         * }
         * ```
         */
        prefix: PrefixGenerator;

        /**
         * The Cooldown Key generator. Tells the dispatcher how to store cooldowns in the database
         * 
         * @default
         * ```js
         * (message, command, _args) => {
         *      return `${command.config.name}:${message.author.id}`
         * }
         * ```
         */
        cooldown: CooldownKeyGenerator;

    };

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
    public readonly guilds: StoreProvider<'string'>;

    private async broadcast(action: 'enable' | 'disable', name: string) {
        if (this.client.shard) {
            this.client.shard.broadcastEval(`this.emit('command', ['${action}','${name}'])`);
        } else {
            this.client.emit('command', [action, name]);
        }
    }

    /**
     * Synchronize the DisabledCommands to the cache
     */
    async synchronize() {
        const entries = await this.DisabledCommands.all();
        for (const [name, reason] of entries) {
            this.cache.set(name, reason);
        }
    }

    /**
     * 
     * @param command The command to check
     * @returns The reason why is it disabled.
     */
    check(command: Command) {
        return this.cache.get(command.config.name);
    }

    /**
     * 
     * @param command The command to enable
     * @returns `true` if it's enabled. `false` if it's already enabled.
     */
    async enable(command: Command) {
        if (!this.cache.has(command.config.name)) return false;
        await this.DisabledCommands.del(command.config.name);
        this.broadcast('enable', command.config.name);
        return true;
    }

    /**
     * 
     * @param command The command to disable
     * @returns `true` if it's disabled. `false` if it's already disabled.
     */
    async disable(command: Command, reason: string = 'No reason provided.') {
        if (this.cache.has(command.config.name)) return false;
        await this.DisabledCommands.set(command.config.name, reason);
        this.broadcast('disable', command.config.name);
        return true;
    }

    /**
     * 
     * @param inhibitor Return `true` to continue executing the command. Return `false` to discontinue executing the command.
     * @param priority The priority of the inhibitor. Defaults to `0`. Higher the number, Higher the priority
     */
    addInhibitor(inhibitor: Inhibitor, priority: number = 0) {
        this.inhibitors.add([inhibitor, priority]);
    }

    /**
     * Await a message from the Message#Author with a timeout
     */
    async awaitReply(message: Message, time: number = 60000): Promise<Message | boolean> {
        try {

            this.awaiting.add(message.author.id);

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
            this.awaiting.delete(message.author.id);
        }
    }

    private async inihibit(message: Message, command: Command, args: string[]) {
        for (const [inhibitor] of [...this.inhibitors].sort(([, a], [, b]) => b - a)) {
            let status = inhibitor(message, command, args);
            if (status.constructor.name === 'Promise') status = await status;
            if (!status) return true;
        }
        return false;
    }

    private shouldHandleMessage(message: Message) {
        if (
            message.partial ||
            message.author.bot ||
            this.awaiting.has(message.author.id)
        ) return false;
        return true;
    }

    private async throttleHandle(message: Message, command: Command) {

        const expiration = await this.cooldowns.get(this.generators.cooldown(message, command));

        if (expiration) {

            const now = Date.now();

            if (expiration < now) {
                this.cooldowns.del(this.generators.cooldown(message, command));
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
        await this.cooldowns.set(
            this.generators.cooldown(message, command),
            Date.now() + (command.config.cooldown * 1000)
        );
    }

    private async exec(message: Message) {

        if (this.shouldHandleMessage(message)) {

            const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${Escapes.regex(await this.generators.prefix(message))})\\s*`);
            if (!prefixRegex.test(message.content)) return;

            const [, matchedPrefix] = message.content.match(prefixRegex);
            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);

            const commandName = args.shift().toLowerCase();
            const command = this.client.resolveCommand(commandName);

            if (!command) return;

            this.awaiting.add(message.author.id);

            try {

                if (await this.throttleHandle(message, command)) return;

                if (await this.inihibit(message, command, args)) return;

                const argv = await ArgumentHandler(this.client, message, args, command.config.argsDefinitions);

                if (argv instanceof ArgumentError) return message.channel.send(argv.message);

                let flow: boolean = true;

                if (typeof command.beforeExecute === 'function') {
                    flow = await command.beforeExecute(message, argv);
                }

                if (flow) {
                    flow = await command.execute(message, argv);
                }

                if (flow !== false) {
                    await this.throttleExec(message, command);

                    if (typeof command.afterExecute === 'function') {
                        await command.afterExecute(message, argv);
                    }
                }

            } catch (err) {

                const errorID = SnowflakeUtil.generate();

                this.client.logger.error(errorID);
                this.client.logger.error(`Error executing command '${command.config.name}'`);
                this.client.logger.error(err);

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
                this.awaiting.delete(message.author.id);
            }
        }
    }
}
