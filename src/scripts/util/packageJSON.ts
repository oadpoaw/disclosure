import { promises as fs } from 'fs';
import path from 'path';
import Package from '../../assets/package.json';
import { version, dependencies, devDependencies, peerDependencies } from '../../../package.json';
import { Dialects } from '../../Typings';

export async function packageJSON(projectPath: string, dialect: Dialects) {
    console.log(`Creating \`package.json\` ...`);

    Package.dependencies['disclosure-discord'] = `^${version}`;
    Package.dependencies['discord.js'] = dependencies['discord.js'];
    Package.devDependencies['@types/node'] = devDependencies['@types/node'];
    Package.devDependencies['@types/ws'] = devDependencies['@types/ws'];
    Package.devDependencies['rimraf'] = devDependencies['rimraf'];
    Package.devDependencies['typescript'] = devDependencies['typescript'];

    if (dialect !== ':memory:') {
        if (dialect === 'mongodb') {
            //@ts-ignore
            Package.dependencies['mongoose'] = peerDependencies['mongoose'];
        } else if (dialect === 'redis') {
            //@ts-ignore
            Package.dependencies['redis'] = peerDependencies['redis'];
            //@ts-ignore
            Package.devDependencies['@types/redis'] = devDependencies['@types/redis'];
        } else {
            //@ts-ignore
            Package.dependencies['sequelize'] = peerDependencies['sequelize'];
            //@ts-ignore
            Package.devDependencies['@types/sequelize'] = devDependencies['@types/sequelize'];
            //@ts-ignore
            Package.devDependencies['@types/validator'] = devDependencies['@types/validator'];

            switch (dialect) {
                case 'mariadb':
                    //@ts-ignore
                    Package.dependencies['mariadb'] = peerDependencies['mariadb'];
                    break;
                case 'mssql':
                    //@ts-ignore
                    Package.dependencies['tedious'] = peerDependencies['tedious'];
                    break;
                case 'mysql':
                    //@ts-ignore
                    Package.dependencies['mysql2'] = peerDependencies['mysql2'];
                    break;
                case 'postgres':
                    //@ts-ignore
                    Package.dependencies['pg'] = peerDependencies['pg'];
                    //@ts-ignore
                    Package.dependencies['pg-hstore'] - peerDependencies['pg-hstore'];
                case 'sqlite':
                    //@ts-ignore
                    Package.dependencies['sqlite3'] = peerDependencies['sqlite3'];
                    break;
            }

        }
    }

    await fs.writeFile(
        path.join(projectPath, 'package.json'),
        JSON.stringify(Package, null, 2)
    );
}