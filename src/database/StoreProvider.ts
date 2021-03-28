export abstract class StoreProvider<T extends ColumnType = ColumnType> {

    constructor() { }

    abstract get(k: string): Promise<ExtractColumnType<T>>;
    abstract set(k: string, v: ExtractColumnType<T>): Promise<void>;
    abstract del(k: string): Promise<boolean>;

}

export type ColumnType = 'boolean' | 'number' | 'string';

export type ExtractColumnType<T extends ColumnType> =
    T extends 'boolean' ? boolean :
    T extends 'number' ? number :
    T extends 'string' ? string :
    never;

export type FunctionProvider<T extends ColumnType = ColumnType> = (s: string, d: T) => StoreProvider<T>;