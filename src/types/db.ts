import Discord = require('discord.js');

import { Guild } from './guilds';

export interface AdminQueryParameters {
    guild: number;
}

export interface DbConnector {
    close(): Promise<undefined>;
    connect(): Promise<undefined>;
    createGuild(guild: Guild | Discord.Guild): Promise<boolean>;
    deleteGuild(guild: Guild | Discord.Guild): Promise<undefined>;
    getGuilds(includeArchived?: boolean): Promise<Array<Guild>>;

    getAdmins(params: AdminQueryParameters): Promise<Array<Admin>>;
    getLeagues(params: LeagueQueryParameters): Promise<Array<League>>;
    getSites(): Promise<Array<Site>>;
    getTeams(params: TeamQueryParameters): Promise<Array<Team>>;
    getWatchers(params: WatcherQueryParameters): Promise<Array<Watcher>>;
    getWatcherTypes(): Promise<Array<WatcherType>>;
}

export interface DbConnectorOptions {}

export interface LeagueQueryParameters {
    site?: number | string;
}

export interface TeamQueryParameters {
    site?: number | string;
    league?: number | string;
}

export interface WatcherQueryParameters {
    guild: number;
    type?: number | string;
    site?: number | string;
    league?: number | string;
    team?: number | string;
    channel?: number | string;
}