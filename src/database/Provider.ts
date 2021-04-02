import { Providers } from '../Constants';
import { DisclosureError } from '../DisclosureError';

import { Memory } from './providers/Memory';
import { MongoDB } from './providers/MongoDB';
import { Redis } from './providers/Redis';
import { Sequelize } from './providers/Sequelize';

export function Provider(uri: string) {

    if (uri === ':memory:') {
        return Memory();
    }

    const protocol = new URL(uri).protocol.replace(/:/, '');

    if (
        protocol === 'mongodb' ||
        protocol === 'mongodb+srv'
    ) {
        return MongoDB(uri);
    }

    if (
        protocol === 'mariadb' ||
        protocol === 'mssql' ||
        protocol === 'mysql' ||
        protocol === 'postgres' ||
        protocol === 'sqlite'
    ) {
        return Sequelize(uri);
    }

    if (protocol === 'redis') {
        return Redis(uri);
    }

    throw new DisclosureError(`Unsupported database dialect '${protocol}'. Supported dialects: ${Providers.join(', ')}`);

}