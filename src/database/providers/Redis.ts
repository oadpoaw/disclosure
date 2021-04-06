import { ColumnType, DisclosureError, ExtractColumnType, FunctionProvider, StoreProvider, validate } from '../..';

export function Redis(uri: string): FunctionProvider {
    try {

        const Redis = require('ioredis') as typeof import('ioredis');

        const provider: FunctionProvider = <T extends ColumnType>(s: string, t: T) => {

            const generateKey = (k: string) => `${t}:${k}`;

            const redis = new Redis(uri);

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

            };
        };

        return provider;

    } catch (_err) {
        throw new DisclosureError(`Please install \'ioredis\' manually.`);
    }
}