import { promises as fs } from 'fs';
import path from 'path';
import Defaults from './assets/disclosure.json';

function merge(defaults: any, obj: any) {
    if (!obj) return defaults;
    for (const key in defaults) {
        if (!Object.prototype.hasOwnProperty.call(obj, key) || obj[key] === undefined) {
            obj[key] = defaults[key];
        } else if (obj[key] === Object(obj[key])) {
            obj[key] = merge(defaults[key], obj[key]);
        }
    }
    return obj;
}

function compare(a: any, b: any) {
    for (const key in b) {
        if (Object.prototype.hasOwnProperty.call(a, key)) {
            if (Array.isArray(a[key]) && !Array.isArray(b[key])) {
                throw 0;
            } else if (typeof a[key] === 'object' && !Array.isArray(a[key])) {
                compare(a[key], b[key]);
            } else if (typeof a[key] !== typeof b[key]) {
                throw 0;
            }
        } else {
            throw 0;
        }
    }
}

export let _scaffold: typeof Defaults;

(async function () {
    try {

        await fs.readdir(path.join(process.cwd(), 'src'));
        await fs.readdir(path.join(process.cwd(), 'src', 'commands'));
        await fs.readdir(path.join(process.cwd(), 'src', 'events'));

        const buffer = await fs.readFile(path.join(process.cwd(), 'disclosure.json'));
        const configuration = JSON.parse(buffer.toString());

        compare(Defaults, configuration);

        _scaffold = merge(Defaults, configuration) as typeof Defaults;

    } catch (err) {
        console.log(new Error(`This is not a valid disclosure-discord project.`));
        process.exit(1);
    }
}());