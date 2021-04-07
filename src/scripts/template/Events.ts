import { ClientEvents } from 'discord.js';

export const Events: Record<keyof ClientEvents, string> = {

    channelCreate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { DMChannel, GuildChannel } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-channelCreate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'channelCreate');
    }

    on(channel: DMChannel | GuildChannel) {

    }

}`,

    channelDelete:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { DMChannel, GuildChannel } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-channelDelete
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'channelCreate');
    }

    on(channel: DMChannel | GuildChannel) {
        
    }

}`,

    channelPinsUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildChannel, TextChannel } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-channelPinsUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'channelPinsUpdate');
    }

    on(channel: DMChannel | TextChannel, time: Date) {
    
    }

}`,

    channelUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { DMChannel, GuildChannel } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-channelUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'channelUpdate');
    }

    on(oldChannel: DMChannel | GuildChannel, newChannel: DMChannel | GuildChannel) {

    }

}`,

    debug:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { DMChannel, GuildChannel } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-debug
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'debug');
    }

    on(info: string) {

    }

}`,

    disconnect:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { DMChannel, GuildChannel } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-disconnect
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'disconnect');
    }

    on(info: any, n: number) {

    }

}`,

    emojiCreate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildEmoji } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-emojiCreate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'emojiCreate');
    }

    on(emoji: GuildEmoji) {

    }

}`,

    emojiDelete:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildEmoji } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-emojiDelete
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'emojiDelete');
    }

    on(emoji: GuildEmoji) {

    }

}`,

    emojiUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildEmoji } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-emojiUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'emojiUpdate');
    }

    on(oldEmoji: GuildEmoji, newEmoji: GuildEmoji) {

    }

}`,

    error:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-error
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'error');
    }

    on(error: Error) {

    }

}`,

    guildBanAdd:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildMember, User } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildBanAdd
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildBanAdd');
    }
    
    on(member: GuildMember, user: User) {
    
    }
    
}`,

    guildBanRemove:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildMember, User } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildBanRemove
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildBanRemove');
    }

    on(member: GuildMember, user: User) {

    }

}`,

    guildCreate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Guild } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildCreate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildCreate');
    }

    on(guild: Guild) {

    }

}`,

    guildDelete:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Guild } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildDelete
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildDelete');
    }

    on(guild: Guild) {

    }

}`,

    guildIntegrationsUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Guild } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildIntegrationsUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildIntegrationsUpdate');
    }

    on(guild: Guild) {

    }

}`,

    guildMemberAdd:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildMember } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberAdd
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildMemberAdd');
    }

    on(member: GuildMember) {

    }

}`,

    guildMemberAvailable:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildMember } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberAvailable
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildMemberAvailable');
    }

    on(member: GuildMember) {

    }

}`,

    guildMemberRemove:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildMember } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberRemove
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildMemberRemove');
    }

    on(member: GuildMember) {

    }

}`,

    guildMembersChunk:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Collection, Guild, GuildMember, Snowflake } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMembersChunk
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildMembersChunk');
    }

    on(members: Collection<Snowflake, GuildMember>, guild: Guild, chunk: { count: number; index: number; nonce: string | undefined }) {

    }

}`,

    guildMemberSpeaking:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildMember, Speaking } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberSpeaking
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildMemberSpeaking');
    }

    on(member: GuildMember, speaking: Speaking) {

    }

}`,

    guildMemberUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { GuildMember } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildMemberUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildMemberUpdate');
    }

    on(oldMember: GuildMember, newMember: GuildMember) {

    }

}`,

    guildUnavailable:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Guild } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildUnavailable
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildUnavailable');
    }

    on(guild: Guild) {

    }

}`,

    guildUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Guild } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'guildUpdate');
    }

    on(guild: Guild) {

    }

}`,

    invalidated:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-invalidated
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'invalidated');
    }

    on() {

    }

}`,

    inviteCreate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Invite } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-inviteCreate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'inviteCreate');
    }

    on(invite: Invite) {

    }

}`,

    inviteDelete:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Invite } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-inviteDelete
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'inviteDelete');
    }

    on(invite: Invite) {

    }

}`,

    message:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Message } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-message
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'message');
    }

    on(message: Message) {

    }

}`,

    messageDelete:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Message } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageDelete
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'messageDelete');
    }

    on(message: Message) {

    }

}`,

    messageDeleteBulk:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Collection, Message, Snowflake } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageDeleteBulk
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'messageDeleteBulk');
    }

    on(messages: Collection<Snowflake, Message>) {

    }

}`,

    messageReactionAdd:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { MessageReaction, User } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageReactionAdd
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'messageReactionAdd');
    }

    on(reaction: MessageReaction, user: User) {

    }

}`,

    messageReactionRemove:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { MessageReaction, User } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageReactionRemove
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'messageReactionRemove');
    }

    on(reaction: MessageReaction, user: User) {

    }

}`,

    messageReactionRemoveAll:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Message } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageReactionRemoveAll
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'messageReactionRemoveAll');
    }

    on(message: Message) {

    }

}`,

    messageReactionRemoveEmoji:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { MessageReaction } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageReactionRemoveEmoji
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'messageReactionRemoveEmoji');
    }

    on(reaction: MessageReaction) {

    }

}`,

    messageUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Message } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'messageUpdate');
    }

    on(oldMessage: Message, newMessage: Message) {

    }

}`,

    presenceUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Presence } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-presenceUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'presenceUpdate');
    }

    on(oldPresence: Presence | null, newMessage: Presence) {

    }

}`,

    rateLimit:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { RateLimitData } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-rateLimit
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'rateLimit');
    }

    on(info: RateLimitData) {

    }

}`,

    ready:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-ready
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'ready');
    }

    once() {

    }

}`,

    roleCreate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Role } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-roleCreate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'roleCreate');
    }

    on(role: Role) {

    }

}`,

    roleDelete:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Role } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-roleDelete
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'roleDelete');
    }

    on(role: Role) {

    }

}`,

    roleUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Role } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-roleUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'roleUpdate');
    }

    on(oldRole: Role, newRole: Role) {

    }

}`,

    shardDisconnect:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-shardDisconnect
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'shardDisconnect');
    }

    on(event: CloseEvent, id: number) {

    }

}`,

    shardError:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-shardError
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'shardError');
    }

    on(error: Error, id: number) {

    }

}`,

    shardReady:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-shardReady
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'shardReady');
    }

    on(id: number, unavailableGuilds: Set<string> | null) {

    }

}`,

    shardReconnecting:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-shardReconnecting
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'shardReconnecting');
    }

    on(id: number) {

    }

}`,

    shardResume:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-shardResume
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'shardResume');
    }

    on(id: number, replayedEvents: number) {

    }

}`,

    typingStart:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { Channel, User } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-typingStart
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'typingStart');
    }

    on(channel: Channel, user: User) {

    }

}`,

    userUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { User } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-userUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'userUpdate');
    }

    on(oldUser: User, newUser: User) {

    }

}`,

    voiceStateUpdate:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { VoiceState } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-voiceStateUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'voiceStateUpdate');
    }

    on(oldState: VoiceState, newState: VoiceState) {

    }

}`,

    warn:
        `import { Disclosure, DiscordEvent } from 'disclosure-discord';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-warn
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'warn');
    }

    on(info: string) {

    }

}`,

    webhookUpdate: 
    `import { Disclosure, DiscordEvent } from 'disclosure-discord';
import { TextChannel } from 'discord.js';

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-webhookUpdate
export default new class extends DiscordEvent {
    constructor(client: Disclosure) {
        super(client, 'webhookUpdate');
    }

    on(channel: TextChannel) {

    }

}`,

};