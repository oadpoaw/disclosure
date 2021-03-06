import { promises as fs } from 'fs';
import path from 'path';
import Package from '../../assets/package.json';
import { version, dependencies, devDependencies } from '../../../package.json';
import { Dialects } from '../../Typings';

export async function packageJSON(projectPath: string, dialect: Dialects) {
    console.log(`Creating \`package.json\` ...`);

    /**
     * So we can keep the dependencies up to date
     */

    Package.dependencies['disclosure-discord'] = `^${version}`;
    Package.dependencies['discord.js'] = dependencies['discord.js'];
    Package.devDependencies['@types/node'] = devDependencies['@types/node'];
    Package.devDependencies['@types/ws'] = devDependencies['@types/ws'];
    Package.devDependencies['concurrently'] = devDependencies['concurrently'];
    Package.devDependencies['nodemon'] = devDependencies['nodemon'];
    Package.devDependencies['rimraf'] = dependencies['rimraf'];
    Package.devDependencies['typescript'] = devDependencies['typescript'];

    /**
     * Manually installing these packages according to whata database is used for
     * the disclosure databse
     */
    if (dialect !== ':memory:') {
        if (dialect === 'mongodb') {
            //@ts-ignore
            Package.dependencies['mongoose'] = devDependencies['mongoose'];
        } else if (dialect === 'redis') {
            //@ts-ignore
            Package.dependencies['ioredis'] = devDependencies['ioredis'];
        } else {
            //@ts-ignore
            Package.dependencies['sequelize'] = devDependencies['sequelize'];

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