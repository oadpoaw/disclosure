import { Client, ClientOptions, Collection, Guild, GuildChannel, Role } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { Command } from './Command';
import { DisclosureError } from './DisclosureError';
import { DisclosureLogger, ExtendedEvent } from './Typings';
import { DiscordEvent } from './DiscordEvent';
import { FunctionProvider, StoreProvider } from './database/StoreProvider';
import { Provider } from './database/Provider';
import { Dispatcher } from './Dispatcher';

export class Disclosure extends Client {

    constructor(database_uri: string = ':memory:', logger: DisclosureLogger = console, clientOptions?: ClientOptions) {
        super(clientOptions);

        this._database_uri = database_uri ?? ':memory:';

        this.logger = logger;

        this.dispatcher = new Dispatcher(this);

    }

    private _database_uri: string;
    public database: FunctionProvider;

    public logger: DisclosureLogger;
    public commands: Collection<string, Command>;
    public dispatcher: Dispatcher;

    async initialize() {
        this.database = await Provider(this._database_uri);
        await this.registerCommands();
        await this.registerEvents();
        this.dispatcher.listen();
    }

    private confliction(command: Command) {

        const errors: DisclosureError[] = [];
        const config = command.config;
        const collision = this.resolveCommand(config.name.toLowerCase());

        if (collision) {
            errors.push(new DisclosureError(`Command with a name/alias of '${config.name}' has been already loaded`));
        }

        for (const alias of config.aliases) {
            if (this.resolveCommand(alias)) {
                errors.push(new DisclosureError(`A Command with a name/alias of '${alias}' has been already loaded`));
            }
        }

        if (errors.length) throw errors;

    }

    private async registerCommands() {

        const filePath = path.join(process.cwd(), 'src', 'commands');
        const files = await fs.readdir(filePath);

        for (const file of files) {
            if ((await fs.lstat(path.join(filePath, file))).isDirectory()) {

                const commands = await fs.readdir(path.join(filePath, file));

                for (const command of commands) {

                    try {

                        const cmdPath = path.join(filePath, file, command);
                        const cc = require(cmdPath);

                        if (cc.default.prototype instanceof Command) {

                            const instance: Command = new cc.default(this);

                            instance.config.category = file.split('.')[0];

                            this.confliction(instance);

                            if (typeof instance.init === 'function') instance.init();
                            this.commands.set(instance.config.name, instance);

                        }

                        delete require.cache[require.resolve(cmdPath)];

                    } catch (err) {

                        this.logger.error(`[COMMANDS] DisclosureError loading '${file}/${command}'`).error(err);

                        process.exit(1);

                    }
                }
            } else if (file.endsWith('.js')) {
                try {

                    const cmdPath = path.join(filePath, file);
                    const cc = require(cmdPath);

                    if (cc.default.prototype instanceof Command) {

                        const instance: Command = new cc.default(this);

                        instance.config.category = null;

                        this.confliction(instance);

                        if (typeof instance.init === 'function') instance.init();
                        this.commands.set(instance.config.name, instance);

                    }

                    delete require.cache[require.resolve(cmdPath)];

                } catch (err) {

                    this.logger.error(`[COMMANDS] DisclosureError loading '${file}'`).error(err);

                    process.exit(1);

                }
            }
        }
    }

    private async registerEvents() {

        const filePath = path.join(process.cwd(), 'src', 'events');
        const files = await fs.readdir(filePath);

        for (const eventFile of files) {
            try {

                const ctx = require(path.join(filePath, eventFile)).default as ExtendedEvent;

                if (ctx.prototype instanceof DiscordEvent) {

                    const instance = new ctx(this);

                    if (typeof instance.init === 'function') instance.init();

                    if (typeof instance.on === 'function') {
                        this.on(instance.eventName as string, (...args) => instance.on(...args));
                    }

                    if (typeof instance.once === 'function') {
                        this.once(instance.eventName as string, (...args) => instance.once(...args));
                    }

                }

                delete require.cache[require.resolve(path.join(filePath, eventFile))];

            } catch (error) {

                this.logger.error(`[EVENTS] DisclosureError loading '${eventFile}'`).error(error);

                process.exit(1);

            }
        }
    }

    resolveCommand(str: string): Command | null {

        const command = this.commands.get(str) || this.commands.find((c) => c.config.aliases.includes(str));

        return command || null;

    }

    async resolveUser(str: string) {

        if (!str || typeof str !== 'string') return null;

        let user = null;

        if (str.match(/^<@!?(\d+)>$/)) {
            user = await this.users.fetch(str.match(/^<@!?(\d+)>$/)[1]).catch(() => { });
        }

        if (!user && str.match(/^!?(\w+)#(\d+)$/)) {
            user = this.users.cache.find((u) =>
                u.username === str.match(/^!?(\w+)#(\d+)$/)[0]
                && u.discriminator === str.match(/^!?(\w+)#(\d+)$/)[1]
            );
        }

        if (!user) {
            user = await this.users.fetch(str).catch(() => { });
        }

        return user || this.users.cache.find((u) => u.username === str);

    }

    async resolveMember(search: string, guild: Guild) {

        if (!search || typeof search !== 'string') return null;

        const user = await this.resolveUser(search);

        return user ? guild.members.fetch(user).catch(() => { }) : null;

    }

    resolveRole(search: string, guild: Guild): Role | null {

        if (!search || typeof search !== 'string') return null;

        let role = null;

        if (search.match(/^<@&!?(\d+)>$/)) {
            role = guild.roles.cache.get(search.match(/^<@&!?(\d+)>$/)[1]);
        }

        if (!role) {
            role = guild.roles.cache.find((r) => r.name.toLowerCase() === search.toLowerCase());
        }

        if (!role) {
            role = guild.roles.cache.get(search);
        }

        return role;

    }

    resolveChannel(search: string, guild: Guild): GuildChannel {

        if (!search || typeof search !== 'string') return null;

        let channel: GuildChannel = null;

        if (search.match(/^<#!?(\d+)>$/)) {
            channel = guild.channels.cache.get(search.match(/^<#!?(\d+)>$/)[1]);
        }

        if (!channel) {
            channel = guild.channels.cache.find((c) => c.name.toLowerCase() === search.toLowerCase());
        }

        if (!channel) {
            channel = guild.channels.cache.get(search);
        }

        return channel;

    }

}