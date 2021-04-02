import { DataType } from './Typings';

export class DisclosureError extends Error {
    constructor(message: string) {
        super(message);
    }
}
export class DisclosureTypeError extends Error {
    constructor(message: string) {
        super(message);
    }
}
export class DisclosureDatabaseValidationError extends Error {
    constructor(message: string) {
        super(message);
    }
}
export class ArgumentError extends Error {
    constructor(public key: string, public value: any, public must: DataType) {
        super(typeof value === 'undefined' ?
            `Missing '${must}' in parameter '--${key}', it must be required.` :
            `Incorrect value for parameter '--${key}', gotten a type of '${typeof value}' instead of '${must}'`
        );
    }
}