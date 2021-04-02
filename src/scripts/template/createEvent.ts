import { prompt } from 'inquirer';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { Events } from './Events';
import { ClientEvents } from 'discord.js';

export default async function createEvent() {
    await import('../../');

    const { eventName } = await prompt([
        {
            type: 'list',
            message: 'Select Event',
            name: 'eventName',
            choices: Object.keys(Events).filter((str) => !existsSync(path.join(path.resolve(process.cwd()), 'src', 'events', `${str}.ts`))),
        }
    ]) as { eventName: keyof ClientEvents; };

    await fs.writeFile(
        path.join(path.resolve(process.cwd()), 'src', 'events', `${eventName}.ts`),
        Events[eventName],
        'utf-8'
    );

    console.log(`Event '${eventName}' created.`);

}