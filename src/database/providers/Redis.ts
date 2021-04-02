import { ColumnType, ExtractColumnType, FunctionProvider, StoreProvider } from '../StoreProvider';
import { DisclosureError } from '../../DisclosureError';
import { validate } from '../util/validate';

export async function Redis(uri: string): Promise<FunctionProvider> {
    return new Promise((resolve, reject) => {
        import('ioredis').then(async (Redis) => {
            try {
                const redis = new Redis.default(uri);
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
                            validate(k, t);
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
                return resolve(provider);
            } catch (err) {
                reject(err);
            }
        }).catch(() => {
            reject(new DisclosureError(`Please install \'sequelize\' manually.`));
        });
    });
}