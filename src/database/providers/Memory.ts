import { ColumnType, ExtractColumnType, FunctionProvider, StoreProvider } from '../StoreProvider';
import { Collection } from 'discord.js';

export function Memory(): FunctionProvider {

    const storage = new Collection<string, any>();

    const provider: FunctionProvider = <T extends ColumnType>(s: string, t: T) => {

        const generateKey = (k: string) => `${s}:${t}:${k}`;

        return new class extends StoreProvider {
            async get(k: string): Promise<ExtractColumnType<T>> {
                return storage.get(generateKey(k));
            }
            async set(k: string, v: ExtractColumnType<T>) {
                storage.set(generateKey(k), v);
            }
            async del(k: string) {
                return storage.delete(generateKey(k));
            }
        };
    };

    return provider;

}