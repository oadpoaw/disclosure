export function indexFile(db_uri: string) {
    return `import { Disclosure } from 'disclosure-discord';

const client = new Disclosure(${db_uri.length ? 'process.env.DATABASE_URI' : '\':memory:\''});

(async function() {
    await client.initialize();

    client.login();
}());`;
}