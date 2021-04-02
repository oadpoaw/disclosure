#!/usr/bin/env node
import minimist from 'minimist';
import builder from 'minimist-options';
import { createCommand } from './template/createCommand';
import createEvent from './template/createEvent';
import { project } from './util/project';

const argv = minimist(process.argv.slice(2), builder({
    cwd: {
        type: 'boolean',
        default: false,
        alias: ['c']
    },
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

    if (!argv._.length) {

        await project(argv.cwd);

    } else if (argv._[0] === 'command') {

        await createCommand(argv);

    } else if (argv._[0] === 'event') {

        await createEvent();

    }

    process.exit();

}());