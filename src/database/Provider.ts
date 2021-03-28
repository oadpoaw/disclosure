import { Providers } from '../Constants';
import { DisclosureError } from '../DisclosureError';
import { Dialects } from '../Typings';
import { Memory } from './providers/Memory';

export function Provider(uri: string) {

    if (uri === ':memory:') {
        return Memory();
    }

    const protocol = new URL(uri).protocol;

    if (!Providers.includes(protocol as Dialects)) {
        throw new DisclosureError(`Unsupported database dialect '${protocol}'. Supported dialects: ${Providers.join(', ')}`);
    }

    


}