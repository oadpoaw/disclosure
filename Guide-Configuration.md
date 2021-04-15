# Configuration

## Contents
- [Configuration](#configuration)
  - [Contents](#contents)
    - [Bot Prefixes](#bot-prefixes)
    - [Command Cooldown](#command-cooldown)
    - [Before Execution Method](#before-execution-method)
    - [Commands Inhibitors](#commands-inhibitors)
    - [Extending the Disclosure Client](#extending-the-disclosure-client)
  - [Advanced Usage](#advanced-usage)

### Bot Prefixes
Disclosure uses a built-in Server side prefixes (Guild only Prefix).
If you want to override the built-in system to generate the prefix,
You can do so by overriding `Dispatcher#generators.prefix` with a new function
that returns the prefix. <br />
Example:
```ts
// This function can be synchronous or asynchronous
// and it must return a string
client.dispatcher.generators.prefix = async (message) => {

    let prefix = client.config.prefix; // Default prefix as set in disclosure.json
    
    // check if the message is sent from a guild
    if (message.guild) {
        // Use your defined guild database model, for example
        const guild = await Guild.findOne({ guild_id: message.guild.id });

        // if the guild does not exist in the database, use the default prefix
        if (!guild) {
            prefix = client.config.prefix;
        } else { // and if the guild exist, use the prefix
            prefix = guild.prefix;
        }

    }

    // now return the prefix
    return prefix;

}

```

### Command Cooldown
Configuring this module is not available yet.
Disclosure uses a built-in command cooldown system that is using a database
(If you are using a database instead of `:memory:` when you created your disclosure project) <br />
You can see the source code [here](./src/Dispatcher.ts) at class member function `throttleHandle` and `throttleExec`

### Before Execution Method
You might wanna run some code before executing the command, <br />
for example like checking if the executor (message author) or the server (guild) is blacklisted. <br />
You can do this by overriding `Dispatcher#beforeExecute` to a new function. <br />
For Example:
```ts
// This function can be asynchronous or synchronous
// and it MUST return a boolean (true or false)
client.dispatcher.beforeExecute = (message) => {

    // Check if the user is blacklisted
    if (blacklistedUsers.has(message.author.id)) {
        // if its true, return false to stop the dispather dispatching the message
        return false;
    }

    // Check if the guild is blacklisted, but as always,
    // check if the message is sent from a guild.
    if (message.guild) {
        if (blacklistedGuilds.has(message.guild.id)) {
            return false;
        }
    }

    // as always, return true to continue dispatching
    return true;

}
```

### Commands Inhibitors
You might wanna run some code before executing the command, <br />
This is different from setting `Dispatcher#beforeExecute`, <br />
the difference between from `Dispatcher#beforeExecute` and inhibitors, <br />
is that `Dispatcher#beforeExecute` runs before `Dispatcher#generators.prefix`.
And the inhibitors runs after `Dispatcher#generators.prefix` if the message content matches a command <br /> <br />

Adding Inhibitors:
```ts
// The function can be asynchronous or synchronous
// Return `true` to continue executing the command. Return `false` to discontinue executing the command.
client.dispatcher.addInhibitor((message, command) => true, 0);
// This function takes a function that callbacks the message object and the command instance which was resolved
// The second parameter takes a number to prioritize the inhibitor, Higher the number, Higher the priority. Defaults to `0`
```
> You can't remove the inhibitor as it does not need to.

### Extending the Disclosure Client
You can extend the client what ever you want like this:
```ts
import { Disclosure } from 'disclosure-discord';

class MyClient extends Disclosure {

    /// ... your methods
}
```
But I prefer do not do it, just don't. It might break at somepoint and you wont get the typings. <br />
A work around this, is extending the typings. For example:
```ts
import { Disclosure } from 'disclosure-discord';

const client = new Disclosure(/**/);

// Extending the class by module augmentation
declare module 'disclosure-discord/dist/src/Disclosure' {
    export interface Disclosure {

        // type safe
        // can be a function or a value
        myFunction: () => any;
    }
}

// No type errors!
client.myFunction = function () {

}
```

## Advanced Usage
For Advanced Command usages check [this](./Advanced.md)