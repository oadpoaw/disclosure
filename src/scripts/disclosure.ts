#!/usr/bin/env node

import minimist from 'minimist';
import builder from 'minimist-options';
import { prompt } from 'inquirer';
import { createCommand } from './template/createCommand';
import createEvent from './template/createEvent';
import { createProject } from './template/createProject';

const argv = minimist(process.argv.slice(2), builder({
    force: {
        type: 'boolean',
        default: false,
        alias: ['f'],
    },
    arguments: 'string',
}));

(async function () {

    if (argv.force) {
        console.warn(`[WARN] Using '--force' or '-f'`);
    }

    if (argv._[0] === 'command') {

        await createCommand(argv);

    } else if (argv._[0] === 'event') {

        await createEvent();

    } else {

        const { answer } = await prompt([
            {
                type: 'list',
                message: 'What do you want to create? (Ctrl+C to cancel)',
                choices: ['Bot', 'Command', 'Event'],
                name: 'answer',
            },
        ]) as { answer: 'Bot' | 'Command' | 'Event'; };

        switch (answer) {
            case 'Bot': {
                createProject();
                break;
            }
            case 'Command': {
                createCommand(argv);
                break;
            }
            case 'Event': {
                createEvent();
                break;
            }
        }

    }

    process.exit();

}());