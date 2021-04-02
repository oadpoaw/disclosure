import { promises as fs } from 'fs';
import path from 'path';
import Package from '../../assets/package.json';
import { version, dependencies, devDependencies } from '../../../package.json';
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
            Package.dependencies['mongoose'] = devDependencies['mongoose'];
        } else if (dialect === 'redis') {
            //@ts-ignore
            Package.dependencies['ioredis'] = devDependencies['ioredis'];
            //@ts-ignore
            Package.devDependencies['@types/ioredis'] = devDependencies['@types/ioredis'];
        } else {
            //@ts-ignore
            Package.dependencies['sequelize'] = devDependencies['sequelize'];
            //@ts-ignore
            Package.devDependencies['@types/sequelize'] = devDependencies['@types/sequelize'];
            //@ts-ignore
            Package.devDependencies['@types/validator'] = devDependencies['@types/validator'];

            switch (dialect) {
                case 'mariadb':
                    //@ts-ignore
                    Package.dependencies['mariadb'] = devDependencies['mariadb'];
                    break;
                case 'mssql':
                    //@ts-ignore
                    Package.dependencies['tedious'] = devDependencies['tedious'];
                    break;
                case 'mysql':
                    //@ts-ignore
                    Package.dependencies['mysql2'] = devDependencies['mysql2'];
                    break;
                case 'postgres':
                    //@ts-ignore
                    Package.dependencies['pg'] = devDependencies['pg'];
                    //@ts-ignore
                    Package.dependencies['pg-hstore'] - devDependencies['pg-hstore'];
                case 'sqlite':
                    //@ts-ignore
                    Package.dependencies['sqlite3'] = devDependencies['sqlite3'];
                    break;
            }

        }
    }

    await fs.writeFile(
        path.join(projectPath, 'package.json'),
        JSON.stringify(Package, null, 2)
    );
}