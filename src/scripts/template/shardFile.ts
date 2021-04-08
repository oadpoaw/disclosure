export function shardFile() {
    return `import { DisclosureSharder } from 'discord.js';

const manager = new DisclosureSharder();

manager.initialize().spawn();

`;
}