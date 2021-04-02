import { promises as fs } from 'fs';
import path from 'path';
import { DisclosureError } from '.';
import Defaults from './assets/disclosure.json';

function merge(defaults: any, obj: any) {
    if (!obj) {
        return defaults;
    }
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
    if (typeof b !== 'object' || Array.isArray(b)) {
        throw new Error();
    }
    for (const key in b) {
        if (Object.prototype.hasOwnProperty.call(a, key)) {
            if (Array.isArray(a[key]) && !Array.isArray(b[key])) {
                throw new Error();
            } else if (typeof a[key] === 'object' && !Array.isArray(a[key])) {
                compare(a[key], b[key]);
            } else if (typeof a[key] !== typeof b[key]) {
                throw new Error();
            }
        } else {
            throw new Error();
        }
    }
}

export let _scaffold: typeof Defaults;

(async function () {
    try {

        const buffer = await fs.readFile(path.join(path.resolve(process.cwd()), 'disclosure.json'));
        const configuration = JSON.parse(buffer.toString());

        compare(Defaults, configuration);

        _scaffold = merge(Defaults, configuration) as typeof Defaults;

    } catch (err) {
        console.log(new DisclosureError(`This is not a valid Disclosure Project. Please make sure you're inside a Disclosure Project`));
        process.exit(1);
    }
}());