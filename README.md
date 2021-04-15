# Disclosure™
[![TS](https://forthebadge.com/images/badges/made-with-typescript.svg)]()
## A Discord Bot Generator CLI & Command Handler

This right here is a simple tool (`` Command Line Interface ``) to scaffold a Discord bot that you or your team would stun the whole discord with in future! 
<br />
<br />
It not only generates an awesome project you can work with but also supports you with it's very own in-built Command Handler
<br />
<br />
This CLI tool allows you to create and manage your Discord Bot project by adding/registering commands & events and **much much more!** , organizing all of your commands & events into its own folder and groups. It will help you Integrate with Git and furthermore help you installing your dependecies and will choose a database for you as well as set it up!
<br /> <br />
You can generate a Discord project with the finest file structure , which will provide a slightly better experience to your whole coding experience for the bot~! <br />
[![works](https://forthebadge.com/images/badges/it-works-why.svg)]() <br/>

## Features
- Easy to use!
- Flexible!
- A CLI to generate a Discord Bot Project! 
- Awesome TypeScript Definitions for awesome developer tooling!
- Sharding Support!
- Active support!
- Built-in Command Handler, includes:
  - Argument Parsing
  - Command Inhibitors
  - Prompts! with strong type definitions
  - Cooldown Throttles (Command Cooldown)
- Supports many databases! See [here](#what-databases-does-it-support)

Also see [Configuration](/Configuration.md) for guides how to edit Disclosure. And [Advanced Usages](Advanced.md) for advanced usages.

## Easy To Setup

### What could have you ever asked for? It is the best CLI made for your project out there so far!
Don't Believe Me? Let me show you how:

```sh
# Using npx to ensure that we are always using the latest version of disclosure-discord
$ npx disclosure-discord
```
![done](/assets/test.gif)

## Initial Project Structure
```sh
├───src
│   ├───commands
│   ├───events
│   └───index.ts
├───.env
├───disclosure.json
├───package-lock.json
└───package.json
```
Yep!, just that and with few lines of code!

## Easy to Use!

### Super-duper easy to use 
Simple commands 
```sh <br> 
$ npx disclosure-discord command
# For a new command

$ npx disclosure-discord event
# For a new event
```
![func](/assets/test2.gif)

### Running the Bot

```sh
npm run build
# To build the project

npm start
# To start the bot!
```

## What Databases does it support?

 - [SQLite](https://www.sqlite.org/index.html)
 - [PostgreSQL](https://www.postgresql.org/)
 - [MariaDB](https://mariadb.org/)
 - [MongoDB](https://www.mongodb.com/)
 - [MySQL](https://www.mysql.com/)
 - [Redis](https://redis.io/)
 - [In-Memory](https://en.wikipedia.org/wiki/In-memory_database)
 - [MsSQL](https://en.wikipedia.org/wiki/Microsoft_SQL_Server)

# Join Us For Support 
[![Join](/assets/Capture.png)](https://discord.gg/HG8s98Uk) <br>
![love](https://forthebadge.com/images/badges/built-with-love.svg)
