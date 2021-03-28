import { prompt } from 'inquirer';
import { lookpath } from 'lookpath';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import ChildProcess from 'child_process';
const exec = promisify(ChildProcess.exec);

const gitignore = `node_modules/\ndist/\n.env`;

export async function git(projectPath: string) {
    if (lookpath('git')) {
        await prompt([
            {
                type: 'confirm',
                message: 'We detected that you are using Git. Do you want to integrate with git?',
                name: 'useGit',
                default: true,
            }
        ]).then(async ({ useGit }) => {
            if (useGit) {

                console.log(`Integrating with Git...`);

                console.log('Creating `.gitignore` ...');

                await fs.writeFile(
                    path.join(projectPath, '.gitignore'),
                    gitignore
                );

                console.log('Running:');

                console.log('$ git init');
                await exec('git init', { cwd: projectPath });

                console.log('$ git add .');
                await exec('git add .', { cwd: projectPath });

                const commitMessage = await prompt([
                    {
                        type: 'input',
                        message: 'Enter Git Commit Message',
                        name: 'message',
                        default: "initial commit",
                    }
                ]).then(({ message }) => message) as string;

                console.log(`$ git commit -m "${commitMessage.replace(/\"/g, '\\"')}"`);
                await exec(`git commit -m "${commitMessage.replace(/\"/g, '\\"')}"`, { cwd: projectPath });

                console.log('Disclosure Project now integrated with Git');

            } else {
                console.log('Understood, not using Git..');
            }
        });
    }
}