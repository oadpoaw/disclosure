import { ColumnType, ExtractColumnType, FunctionProvider, StoreProvider, validate } from '../..';
import { Collection } from 'discord.js';

export function Memory(): FunctionProvider {

    const provider: FunctionProvider = <T extends ColumnType>(s: string, t: T) => {

        const storage = new Collection<string, ExtractColumnType<T>>();

        return new class extends StoreProvider {

            async get(k: string): Promise<ExtractColumnType<T>> {
                return storage.get(k);
            }

            async set(k: string, v: ExtractColumnType<T>) {
                validate(v, t);
                storage.set(k, v);
            }

            async del(k: string) {
                return storage.delete(k);
            }

            async clr() {
                storage.clear();
            }

            async all() {
                return storage.map((v, k) => [k, v]) as [string, ExtractColumnType<T>][];
            }

        };
    };

    return provider;

}