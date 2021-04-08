import { ColumnType, DisclosureError, ExtractColumnType, FunctionProvider, StoreProvider, validate } from '../..';

export function Redis(uri: string): FunctionProvider {
    try {

        const Redis = require('ioredis') as typeof import('ioredis');
        const redis = new Redis(uri);

        const provider: FunctionProvider = <T extends ColumnType>(s: string, t: T) => {

            const generateKey = (k: string) => `${t}:${k}`;

            return new class extends StoreProvider {

                async get(k: string): Promise<ExtractColumnType<T>> {
                    const value = await redis.get(generateKey(k));
                    if (value === null) {
                        return undefined;
                    }
                    return value as ExtractColumnType<T>;
                }

                async set(k: string, v: ExtractColumnType<T>) {
                    validate(v, t);
                    if (typeof v !== 'undefined') {
                        await redis.set(generateKey(k), v as any);
                        await redis.sadd(s, k);
                    }
                }

                async del(k: string) {
                    const items = await redis.del(generateKey(k));
                    await redis.srem(s, k);
                    return items > 0;
                }

                async clr() {
                    const keys = await redis.smembers(s);
                    await redis.del(keys.concat(s));
                }

                async all() {
                    const entries = await redis.keys(s);
                    const mapped = [] as [string, ExtractColumnType<T>][];
                    // Not using Array#map because getting the value is asynchronous and since we can't use async/await in Array#map
                    // So this is a work around.
                    for (const entry of entries) {
                        mapped.push([entry, await this.get(entry)]);
                    }
                    return mapped as [string, ExtractColumnType<T>][];
                }

            };
        };

        return provider;

    } catch (_err) {
        throw new DisclosureError(`Please install \'ioredis\' manually.`);
    }
}