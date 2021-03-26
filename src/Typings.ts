import { CategoryChannel, Message, MessageEmbed, PermissionString, Role, TextChannel, User, VoiceChannel } from 'discord.js';
import { Command } from '.';
import { Disclosure } from './Disclosure';
import { DiscordEvent } from './DiscordEvent';

export interface DisclosureLogger {
    info: (message: any) => any;
    error: (message: any) => any;
}

export interface ExtendedEvent extends DiscordEvent {
    new(client: Disclosure): this;
}

export interface CommandConfig {
    name: string;
    description: string;
    category?: string;
    usage: string;
    args: number;
    cooldown: number;
    aliases: string[];
    userPermissions: PermissionString[];
    clientPermissions: PermissionString[];
    guildOnly: boolean;
    ownerOnly: boolean;
    argsDefinitions?: ArgsDefinition;
    path?: string;
}

export interface Arguments {
    _: string[];
    [key: string]: any;
}

export type DataType = 'string' | 'boolean' | 'number' | 'User' | 'Role' | 'TextChannel' | 'VoiceChannel' | 'CategoryChannel' | 'Command';

export type ResolvableArray<T> = T[] | (() => T[] | Promise<T[]>);
export type ValidateFunction<T> = (v: T, m: Message) => boolean | Promise<boolean>;

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

export type ArgsDefinition = Record<string, StringDefinition | BooleanDefinition | NumberDefinition | UserDefinition | RoleDefinition | TextChannelDefinition | VoiceChannelDefinition | CategoryChannelDefinition | CommandDefinition>;

export interface ArgvDefinition {
    type: DataType;
    default?: any;
    alias?: string | string[];
}

export interface StringDefinition extends ArgvDefinition {
    type: 'string';
    default?: string;
    validate?: ValidateFunction<string>;
}

export interface BooleanDefinition extends ArgvDefinition {
    type: 'boolean';
    default?: boolean;
    validate?: ValidateFunction<boolean>;
}

export interface NumberDefinition extends ArgvDefinition {
    type: 'number';
    default?: number;
    validate?: ValidateFunction<number>;
}

export interface UserDefinition extends ArgvDefinition {
    type: 'User';
    validate?: ValidateFunction<User>;
}

export interface RoleDefinition extends ArgvDefinition {
    type: 'Role';
    validate?: ValidateFunction<Role>;
}

export interface TextChannelDefinition extends ArgvDefinition {
    type: 'TextChannel';
    validate?: ValidateFunction<TextChannel>;
}

export interface VoiceChannelDefinition extends ArgvDefinition {
    type: 'VoiceChannel';
    validate?: ValidateFunction<VoiceChannel>;
}

export interface CategoryChannelDefinition extends ArgvDefinition {
    type: 'CategoryChannel';
    validate?: ValidateFunction<CategoryChannel>;
}

export interface CommandDefinition extends ArgvDefinition {
    type: 'Command';
    validate?: ValidateFunction<Command>;
}

export type Prompts = Record<string, PromptOption>;

export interface PromptOption {
    type: DataType;
    message: string | MessageEmbed;
    timeout?: {
        duration: number;
        message?: string;
    };
    validation?: {
        errorMsg: string | MessageEmbed;
        validate: (v: any) => boolean | Promise<boolean>;
    };
}