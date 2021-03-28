#!/usr/bin/env node
import minimist from 'minimist';
import builder from 'minimist-options';
import { project } from './util/project';

const argv = minimist(process.argv.slice(2), builder({
    cwd: {
        type: 'boolean',
        default: false,
        alias: ['c']
    },
    arguments: 'string',
}));

(async function () {

    if (!argv._.length) {

        await project(argv.cwd);

    } else if (argv._[0] === 'command') {

    } else if (argv._[0] === 'event') {

    }

    process.exit();

}());