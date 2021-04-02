import { DisclosureDatabaseValidationError } from '../../DisclosureError';
import { ColumnType } from '../StoreProvider';

export function validate(v: any, type: ColumnType) {
    if (typeof v !== type) {
        throw new DisclosureDatabaseValidationError(`Expected a type of '${type}' but gotten a type of '${typeof v}'`);
    }
}