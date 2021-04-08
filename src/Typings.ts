import { APIMessageContentResolvable, CategoryChannel, Message, MessageAdditions, MessageOptions, PermissionString, Role, TextChannel, User, VoiceChannel } from 'discord.js';
import { Command } from '.';

export type DataType = 'string' | 'boolean' | 'number' | 'User' | 'Role' | 'TextChannel' | 'VoiceChannel' | 'CategoryChannel' | 'Command';
export type Dialects = ':memory:' | 'mariadb' | 'mongodb' | 'mssql' | 'mysql' | 'postgres' | 'redis' | 'sqlite';
export type ResolvableArray<T> = T[] | (() => T[] | Promise<T[]>);
export type ValidateFunction<T> = (v: T, m: Message) => boolean | Promise<boolean>;
export type MessageResolvable = APIMessageContentResolvable | (MessageOptions & { split?: false; }) | MessageAdditions;

export interface DisclosureLogger {
    info: (message: any) => any;
    error: (message: any) => any;
    warn: (message: any) => any;
}

export interface CommandConfig {

    /**
     * The Name of the command.
     */
    name: string;

    /**
     * The Description of the command.
     */
    description: string;

    /**
     * The Category of the command.
     */
    category?: string;

    /**
     * The Cooldown of the command. (In Seconds)
     */
    cooldown: number;

    /**
     * The amount of required arguments to execute the command.
     */
    args: number;

    /**
     * The Usages on how to use the command.
     */
    usage: string[];

    /**
     * The Aliases of the command.
     */
    aliases: string[];

    /**
     * The required permissions to execute the command by the user.
     */
    userPermissions: PermissionString[];

    /**
     * The required permissions to execute the command by the bot.
     */
    clientPermissions: PermissionString[];

    /**
     * Whether this command can be executed inside a Guild/Server.
     */
    guildOnly: boolean;

    /**
     * Whether this command can be executed by the Bot Owner.
     */
    ownerOnly: boolean;

    /**
     * Predefined Magic.
     * 
     * Parse the user arguments
     * 
     * @default undefined
     */
    argsDefinitions?: ArgsDefinition;
}

export interface Arguments {
    /**
     * The arguments stored in a string array
     */
    _: string[];

    /**
     * Whole arguments stored in a string array
     */
    __: string[];
    [key: string]: any;
}

/**
 * MAGIC!!!
 */


export type ExtractData<T extends ArgsDefinition | Prompts = ArgsDefinition> = {
    [P in keyof T]: ExtractDataType<T[P]['type']>;
};

export type ExtractDataType<T extends DataType> =
    T extends 'string' ? string :
    T extends 'boolean' ? boolean :
    T extends 'number' ? number :
    T extends 'User' ? User :
    T extends 'Role' ? Role :
    T extends 'TextChannel' ? TextChannel :
    T extends 'VoiceChannel' ? VoiceChannel :
    T extends 'CategoryChannel' ? CategoryChannel :
    T extends 'Command' ? Command :
    never;

export interface ArgvDefinition {

    /**
     * The DataType for the argument definition.
     */
    type: DataType;

    /**
     * The Aliase(s) for the argument definition.
     */
    alias?: string | string[];

}

export interface PromptOption {

    /**
     * The DataType for the prompt definition.
     */
    type: DataType;

    /**
     * The message to be sent when the prompt begins.
     */
    message: MessageResolvable;

    timeout?: {

        /**
         * The duration when to throw a timeout error.
         */

        duration: number;

        /**
         * The message to be sent when the prompt times out.
         */
        message?: string;

    };
}

export type ArgsDefinition = Record<string, ArgvDefinition & (
    {
        type: 'string';
        default?: string;
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<string>;
    } | {
        type: 'boolean';
        default?: boolean;
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<boolean>;
    } | {
        type: 'number';
        default?: number;
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<number>;
    } | {
        type: 'User';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<User>;
    } | {
        type: 'Role';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<Role>;
    } | {
        type: 'TextChannel';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<TextChannel>;
    } | {
        type: 'VoiceChannel';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<VoiceChannel>;
    } | {
        type: 'CategoryChannel';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<CategoryChannel>;
    } | {
        type: 'Command';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<Command>;
    })
>;

export type Prompts = Record<string, PromptOption & (
    {
        type: 'boolean';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<boolean>;
    } | {
        type: 'string';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<string>;
    } | {
        type: 'number';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<number>;
    } | {
        type: 'User';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<User>;
    } | {
        type: 'Role';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<Role>;
    } | {
        type: 'TextChannel';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<TextChannel>;
    } | {
        type: 'VoiceChannel';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<VoiceChannel>;
    } | {
        type: 'CategoryChannel';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<CategoryChannel>;
    } | {
        type: 'Command';
        /**
         * Return `true` if  the validation **succeeded**.
         * Return `false` if the validation **failed**.
         */
        validate?: ValidateFunction<Command>;
    })
>;