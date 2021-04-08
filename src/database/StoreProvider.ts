import { DisclosureDatabaseValidationError } from '..';

export abstract class StoreProvider<T extends ColumnType = ColumnType> {

    constructor() { }

    /**
     * Retrieves the data assigned to the key.
     * @param k 
     */
    abstract get(k: string): Promise<ExtractColumnType<T>>;

    /**
     * Sets the data assigned to the key.
     * @param k 
     * @param v 
     */
    abstract set(k: string, v: ExtractColumnType<T>): Promise<void>;

    /**
     * Deletes the data assigned to the key.
     * @param k 
     */
    abstract del(k: string): Promise<boolean>;

    /**
     * Clears the contents of the store.
     */
    abstract clr(): Promise<void>;

    /**
     * Gets all of the items in the store.
     */
    abstract all(): Promise<[string, ExtractColumnType<T>][]>;

}

export type ColumnType = 'boolean' | 'number' | 'string';

export type ExtractColumnType<T extends ColumnType> =
    T extends 'boolean' ? boolean :
    T extends 'number' ? number :
    T extends 'string' ? string :
    never;

export type FunctionProvider<T extends ColumnType = ColumnType> = (s: string, d: T) => StoreProvider<T>;

export function validate(v: any, type: ColumnType) {
    if (typeof v !== type) {
        throw new DisclosureDatabaseValidationError(`Expected a type of '${type}' but gotten a type of '${typeof v}'`);
    }
}