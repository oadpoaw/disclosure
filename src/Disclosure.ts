import { Client, ClientOptions, Collection, Guild, GuildChannel, Role } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { FunctionProvider } from './database/StoreProvider';
import { Provider } from './database/Provider';
import { Command, Config, DisclosureError, DisclosureLogger, DiscordEvent, Dispatcher, Scaffold, } from '.';

export class Disclosure extends Client {

    /**
     * 
     * @param database_uri the databse uri @default ':memory:'
     * @param clientOptions the ClientOptions to be passed to Discord.js Client @default {}
     * @param logger the logger to be used @default console
     */
    constructor(database_uri: string = ':memory:', clientOptions?: ClientOptions, logger: DisclosureLogger = console) {
        super(clientOptions);

        this.config = Scaffold();
        this.database = Provider(database_uri);
        this.logger = logger;
        this.commands = new Collection();
        this.dispatcher = new Dispatcher(this);

        this.initialized = false;

    }

    private initialized: boolean;

    /**
     * The Logger passed in the 3rd Parameter when instantiating the Disclosure Client
     */
    public readonly logger: DisclosureLogger;

    /**
     * The configuration for Disclosure.
     * Generated/Read from the Current Working Directory file `disclosure.json`
     */
    public readonly config: Config;

    /**
     * The database provider to store guild prefixes, cooldowns
     */
    public readonly database: FunctionProvider;

    /**
     * The commands loaded.
     */
    public readonly commands: Collection<string, Command>;

    /**
     * The command dispatcher/runner.
     */
    public readonly dispatcher: Dispatcher;

    /**
     * Initialize Disclosure Client
     * - This loads all commands 
     * - This loads all events
     */
    async initialize() {
        if (this.initialized) throw new DisclosureError(`Disclosure Client Has Already Been Initialized`);
        await this.registerCommands();
        await this.registerEvents();
        this.initialized = true;
    }

    /**
     * Resolve a command
     * @param str Command's name or one of it's aliases
     */
    resolveCommand(str: string): Command | null {

        const command = this.commands.get(str) || this.commands.find((c) => c.config.aliases.includes(str));

        return command || null;

    }

    /**
     * 
     * @param str User's ID, Tag, Username, or a user mention.
     */
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

    /**
     * 
     * @param search Member's ID, Tag, Username, or a user mention.
     * @param guild The Guild Object
     */
    async resolveMember(search: string, guild: Guild) {

        if (!search || typeof search !== 'string') return null;

        const user = await this.resolveUser(search);

        return user ? guild.members.fetch(user).catch(() => { }) : null;

    }

    /**
     * 
     * @param search Role's ID, Name, or a role mention.
     * @param guild The Guild Object
     */
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

    /**
     * 
     * @param search Channel's ID, Name or a channel mention
     * @param guild The Guild Object
     */
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

        const filePath = path.join(process.cwd(), 'dist', 'commands');
        const files = await fs.readdir(filePath);

        for (const file of files) {
            if ((await fs.lstat(path.join(filePath, file))).isDirectory()) {

                const commands = await fs.readdir(path.join(filePath, file));

                for (const command of commands) {

                    if (command.endsWith('.js')) {
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

        const filePath = path.join(process.cwd(), 'dist', 'events');
        const files = await fs.readdir(filePath);

        for (const eventFile of files) {
            if (eventFile.endsWith('.js')) {
                try {

                    const ctx = require(path.join(filePath, eventFile)).default;

                    if (ctx.prototype instanceof DiscordEvent) {

                        const instance: DiscordEvent = new ctx(this);

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
    }

}
