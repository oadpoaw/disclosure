import { ColumnType, DisclosureError, ExtractColumnType, FunctionProvider, StoreProvider, validate } from '../..';

export function Redis(uri: string): FunctionProvider {
    try {

        const Redis = require('ioredis') as typeof import('ioredis');

        const redis = new Redis(uri);

        const provider: FunctionProvider = <T extends ColumnType>(s: string, t: T) => {

            const generateKey = (k: string) => `${s}:${t}:${k}`;

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
                    }
                }

                async del(k: string) {
                    const items = await redis.del(generateKey(k));
                    return items > 0;
                }

            };
        };

        return provider;

    } catch (_err) {
        throw new DisclosureError(`Please install \'ioredis\' manually.`);
    }
}