import { prompt } from 'inquirer';
import path from 'path';
import { promises as fs } from 'fs';
import Config from '../../assets/disclosure.json';
import TSConfig from '../../assets/tsconfig.json';
import { Dialects } from '../../Typings';
import { Providers } from '../../Constants';
import { isFileExists } from './isFileExists';
import { packageJSON } from './packageJSON';
import { promisify } from 'util';
import ChildProcess from 'child_process';
import { git } from './git';
import { indexFile } from '../template/indexFile';
const exec = promisify(ChildProcess.exec);

async function overwrite(projectPath: string) {
    const exists = await isFileExists(path.join(projectPath, 'disclosure.json')) ||
        await isFileExists(path.join(projectPath, 'src')) ||
        await isFileExists(path.join(projectPath, 'package.json'));

    if (exists) {
        await prompt([
            {
                type: 'confirm',
                message: 'Disclosure Project Already exists, Do you want to overwrite?',
                default: true,
                name: 'overwrite',
            },
        ]).then(({ overwrite }) => {
            if (!overwrite) process.exit(0);
        });
    }
}

async function createFolderStructure(projectPath: string) {
    console.log(`Creating Disclosure Project Folder Structure...`);
    await fs.mkdir(path.join(projectPath, 'src', 'commands'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'src', 'events'), { recursive: true });
};

async function createDisclosureJSON(projectPath: string) {
    console.log(`Creating \`disclosure.json\` ...`);
    await fs.writeFile(
        path.join(projectPath, 'disclosure.json'),
        JSON.stringify(Config, null, 4)
    );
}

function credentials() {
    return prompt([
        {
            type: 'password',
            message: 'Enter Discord Bot Token (You can skip this)',
            name: 'token',
            default: '',
        },
        {
            type: 'list',
            message: 'Choose a database',
            name: 'protocol',
            choices: Providers,
            default: ':memory:',
        }
    ]) as Promise<{ token: string, protocol: Dialects; }>;
}

async function installDependencies(projectPath: string) {
    await prompt([
        {
            type: 'confirm',
            message: 'Do you want to install the project\'s dependencies right away?',
            default: true,
            name: 'install',
        },
    ]).then(async ({ install }) => {
        if (install) {
            console.log('Installing Dependencies...');
            console.time('dependencies');
            await exec('npm install', { cwd: projectPath });
            console.timeEnd('dependencies');
        }
    });
}

function getDefaultURIForDialect(dialect: Dialects) {
    switch (dialect) {
        case 'mariadb':
            return 'mariadb://localhost/disclosure';
        case 'mongodb':
            return 'mongodb://localhost/disclosure';
        case 'mssql':
            return 'mssql://localhost/disclosure';
        case 'mysql':
            return 'mysql://localhost/disclosure';
        case 'postgres':
            return 'postgres://localhost/disclosure';
        case 'redis':
            return 'redis://localhost/disclosure';
        case 'sqlite':
            return 'sqlite://disclosure.sqlite';
    }
}

async function getDatabaseURI(dialect: Dialects) {
    if (dialect === ':memory:') return '';
    return await prompt([
        {
            type: 'input',
            message: `Enter your '${dialect}' database connection URI`,
            name: 'uri',
            default: getDefaultURIForDialect(dialect),
            validate: (uri) => {
                try {
                    const protocol = new URL(uri).protocol.replace(':', '');
                    console.log({ protocol, dialect });
                    if (protocol !== dialect) {
                        if (dialect === 'mongodb') {
                            if (protocol !== 'mongodb+srv') {
                                return `Expected a valid '${dialect}' connection URI`;;
                            }
                        } else {
                            return `Expected a valid '${dialect}' connection URI`;
                        }
                    }
                    return true;
                } catch (err) {
                    return `Expected a valid '${dialect}' connection URI`;
                }
            },
        }
    ]).then(({ uri }) => uri) as string;
}

async function createIndexFile(projectPath: string, uri: string) {
    console.log('Creating `src/index.ts` file...');
    await fs.writeFile(
        path.join(projectPath, 'src', 'index.ts'),
        indexFile(uri)
    );
}

async function createEnvFile(projectPath: string, token: string, uri: string) {
    console.log('Creating `.env` file...');
    await fs.writeFile(
        path.join(projectPath, '.env'),
        `DISCORD_TOKEN=${token}\n${uri.length ? `DATABASE_URI=${uri}` : ''}`
    );
}

async function createTSConfigFile(projectPath: string) {
    console.log('Creating `tsconfig.json` file...');
    await fs.writeFile(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify(TSConfig, null, 2)
    );
}

export async function project(cwd: boolean) {

    const name: string = cwd ?
        path.basename(path.resolve(process.cwd())) :
        await prompt([{
            type: 'input',
            message: 'Enter Project Name',
            name: 'name',
        }]).then(({ name }) => name);

    const projectPath = cwd ? path.resolve(process.cwd()) : path.join(path.resolve(process.cwd()), name);

    await overwrite(projectPath);

    if (!cwd) await fs.mkdir(projectPath);

    const { protocol, token } = await credentials();
    const uri = await getDatabaseURI(protocol);

    await packageJSON(projectPath, protocol);
    await createFolderStructure(projectPath);
    await createDisclosureJSON(projectPath);
    await createIndexFile(projectPath, uri);
    await createEnvFile(projectPath, token, uri);
    await createTSConfigFile(projectPath);
    await git(projectPath);
    await installDependencies(projectPath);

    console.log(`Disclosure Project '${name}' created.`);

}