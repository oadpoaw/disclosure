import { prompt } from 'inquirer';
import path from 'path';
import { promises as fs } from 'fs';
import Config from '../../assets/disclosure.json';
import TSConfig from '../../assets/tsconfig.json';
import { Dialects } from '../../Typings';
import { Providers } from '../../Constants';
import { isFileExists } from '../util/isFileExists';
import { packageJSON } from './packageJSON';
import { promisify } from 'util';
import ChildProcess from 'child_process';
import { indexFile } from '../template/indexFile';
import rimraf from 'rimraf';
import { lookpath } from 'lookpath';
import { shardFile } from './shardFile';

const exec = promisify(ChildProcess.exec);

async function overwrite(projectPath: string) {
    const exists = await isFileExists(path.join(projectPath, 'disclosure.json'));

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
        },
        {
            type: 'confirm',
            message: 'Use Automatic Bot Sharding?',
            name: 'sharding',
            default: false,
        }
    ]) as Promise<{ token: string, protocol: Dialects; sharding: boolean; }>;
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

async function createIndexFile(projectPath: string, uri: string, sharding: boolean) {
    console.log('Creating `src/index.ts` file...');
    await fs.writeFile(
        path.join(projectPath, 'src', 'index.ts'),
        sharding ? shardFile() : indexFile(uri)
    );
    if (sharding) {
        console.log('Creating `src/Bot.ts` file...');
        await fs.writeFile(
            path.join(projectPath, 'src', 'Bot.ts'),
            indexFile(uri)
        );
    }
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

export async function createProject() {

    const name: string = await prompt([
        {
            type: 'input',
            message: 'Enter Project Name',
            name: 'name',
        }
    ]).then(({ name }) => name);

    const projectPath = path.join(path.resolve(process.cwd()), name);

    await overwrite(projectPath);

    try {

        const { protocol, token, sharding } = await credentials();
        const uri = await getDatabaseURI(protocol);

        await fs.mkdir(projectPath);
        await packageJSON(projectPath, protocol);
        await createFolderStructure(projectPath);
        await createDisclosureJSON(projectPath);
        await createIndexFile(projectPath, uri, sharding);
        await createEnvFile(projectPath, token, uri);
        await createTSConfigFile(projectPath);
        await installDependencies(projectPath);

    } catch (err) {

        console.error(err);

        console.log(`Deleting ./${path.basename(projectPath)}`);

        rimraf(projectPath, console.error);

        process.exit(1);

    }

    try {
        if (lookpath('git')) {
            await fs.writeFile(
                path.join(projectPath, '.gitignore'),
                `node_modules/\ndist/\n.env`
            );
            await exec('git init', { cwd: projectPath });
            await exec('git add .', { cwd: projectPath });
            await exec(`git commit -m "Initial Disclosure Project"`, { cwd: projectPath });
        }
    } catch (_err) {

    }

    console.log(`Disclosure Project '${name}' created.`);

}