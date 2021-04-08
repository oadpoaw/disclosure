import { ShardingManager } from 'discord.js';
import { DisclosureLogger } from '.';
import { DisclosureError } from './DisclosureError';

export class DisclosureSharder extends ShardingManager {

    /**
     * 
     * @param options The options to be passed
     * @param logger the logger to be used
     *  @default console
     */
    constructor(options: ConstructorParameters<typeof ShardingManager>[1] = {}, logger: DisclosureLogger = console) {
        super('./dist/Bot.js', options);

        this.logger = logger;

        this.initialized = false;

    }

    private initialized: boolean;
    public logger: DisclosureLogger;


    public initialize() {
        if (this.initialized) throw new DisclosureError(`DisclosureSharder has already been initiated.`);

        this.initialized = true;

        this.on('shardCreate', (shard) => {

            shard.on('ready', () => {

                this.logger.info(`[SHARD][${shard.process.pid}][${shard.id}] ready`);

            });

            shard.on('spawn', (child) => {

                this.logger.info(`[SHARD][${child.pid}][${shard.id}] spawned`);

            });

            shard.on('reconnecting', () => {

                this.logger.info(`[SHARD][${shard.process.pid}][${shard.id}] reconnecting...`);

            });

            shard.on('death', (child) => {

                this.logger.error(`[SHARD][${child.pid}][${shard.id}] died`);

            });

            shard.on('disconnect', () => {

                this.logger.warn(`[SHARD][${shard.process.pid}][${shard.id}] disconnected`);

            });

            shard.on('error', (error) => {

                this.logger.error(`[SHARD][${shard.process.pid}][${shard.id}] Error:`);
                this.logger.error(error);

            });

            this.logger.info(`[SHARD][...][${shard.id}] created`);

        });

        return this;

    }

    /**
     * Get the total count of users or guilds.
     * 
     * Useful for making APIs
     */
    async getCount(props: 'users' | 'guilds') {
        if (props === 'users') {

            const raw = await this.broadcastEval(`this.guilds.cache.reduce((acc, cur) => acc + cur.memberCount, 0)`);

            return raw.reduce((acc, cur) => acc + cur, 0);

        } else if (props === 'guilds') {

            const raw = await this.broadcastEval(`this.guilds.cache.size`);

            return raw.reduce((acc, cur) => acc + cur, 0);

        }
    }

}